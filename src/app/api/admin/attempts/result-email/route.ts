import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendExamResultEmail } from '@/lib/mail';

export const runtime = 'nodejs';

const Body = z.object({ attemptIds: z.array(z.string().min(1)).min(1).max(50) });

/**
 * Admin: (re)send the EXAM_RESULT score report email for submitted attempts —
 * for candidates whose result email never went out (e.g. they submitted
 * before the email existed, or mail was down). The normal send happens once,
 * automatically, in finalizeAttempt(); this is the manual catch-up.
 * Teasers, guest attempts and unsubmitted attempts are skipped, not errors.
 */
export async function POST(req: Request) {
  const session = await auth();
  const admin = session?.user as { id?: string; role?: string; impersonatedBy?: string } | undefined;
  if (admin?.role !== 'ADMIN' || admin.impersonatedBy) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'attemptIds: 1 to 50 attempt ids' }, { status: 400 });
  const ids = [...new Set(parsed.data.attemptIds)];

  const attempts = await db.attempt.findMany({
    where: { id: { in: ids } },
    select: { id: true, userId: true, isTeaser: true, submittedAt: true }
  });
  const byId = new Map(attempts.map((a) => [a.id, a]));
  const results: { attemptId: string; status: 'sent' | 'skipped' | 'failed'; reason?: string }[] = [];
  // One at a time: each send renders a PDF and opens a mail connection.
  for (const id of ids) {
    const a = byId.get(id);
    const skip = !a ? 'not found' : !a.submittedAt ? 'not submitted' : !a.userId ? 'guest attempt' : a.isTeaser ? 'teaser' : null;
    if (skip) {
      results.push({ attemptId: id, status: 'skipped', reason: skip });
      continue;
    }
    try {
      const info = await sendExamResultEmail(id);
      results.push(info ? { attemptId: id, status: 'sent' } : { attemptId: id, status: 'skipped', reason: 'template disabled or account inactive' });
    } catch (err: any) {
      results.push({ attemptId: id, status: 'failed', reason: String(err?.message ?? err).slice(0, 200) });
    }
  }

  await db.adminLog.create({
    data: {
      adminId: admin.id!,
      action: 'attempt.result_email',
      targetType: 'Attempt',
      targetId: ids.length === 1 ? ids[0] : `${ids.length} attempts`,
      metadata: JSON.parse(JSON.stringify({ results }))
    }
  });
  const count = (s: string) => results.filter((r) => r.status === s).length;
  return NextResponse.json({ ok: true, sent: count('sent'), skipped: count('skipped'), failed: count('failed'), results });
}
