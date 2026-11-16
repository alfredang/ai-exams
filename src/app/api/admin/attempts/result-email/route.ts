import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { resendResultEmails } from '@/lib/finalize-attempt';

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
  const results = await resendResultEmails(ids);

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
