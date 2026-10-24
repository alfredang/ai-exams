import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  SCOPE_ASSIGN_PRACTICE_EXAMS,
  apiError,
  findUserByEmail,
  listPracticeExams,
  requireApiToken,
  resolvePracticeExam
} from '@/lib/api-v1';
import { PRACTICE_ACCESS_TIERS, hasPracticeAccess, poolAccessExamIds } from '@/lib/question-pool';

export const dynamic = 'force-dynamic';

const Body = z.object({
  email: z.string().email(),
  exam: z.string().min(1)
});

async function parseBody(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return { response: apiError('Body must be JSON { "email": string, "exam": string }', 400) };
  return { body: parsed.data };
}

/** GET /api/v1/assignments?email= — every practice exam the user can open, and how. */
export async function GET(req: Request) {
  const auth = await requireApiToken(req, SCOPE_ASSIGN_PRACTICE_EXAMS);
  if ('response' in auth) return auth.response;

  const email = new URL(req.url).searchParams.get('email') || '';
  const user = email ? await findUserByEmail(email) : null;
  if (!user) return apiError('No user with that email', 404);

  const [ents, catalog] = await Promise.all([
    db.entitlement.findMany({
      where: { userId: user.id, tier: { in: [...PRACTICE_ACCESS_TIERS] } },
      orderBy: { grantedAt: 'asc' },
      select: { tier: true, grantedAt: true, exam: { select: { id: true, poolExamId: true } } }
    }),
    listPracticeExams()
  ]);
  const byExamId = new Map(catalog.map((p) => [p.examId, p]));
  const assignments = new Map<string, { practiceExam: (typeof catalog)[number]; tiers: string[]; grantedAt: Date }>();
  for (const e of ents) {
    const pe = byExamId.get(e.exam.poolExamId ?? e.exam.id);
    if (!pe) continue;
    const row = assignments.get(pe.examId) ?? { practiceExam: pe, tiers: [], grantedAt: e.grantedAt };
    if (!row.tiers.includes(e.tier)) row.tiers.push(e.tier);
    assignments.set(pe.examId, row);
  }
  return NextResponse.json({ user, assignments: [...assignments.values()] });
}

/** POST /api/v1/assignments { email, exam } — grant the practice exam (ADMIN_GRANT). Idempotent. */
export async function POST(req: Request) {
  const auth = await requireApiToken(req, SCOPE_ASSIGN_PRACTICE_EXAMS);
  if ('response' in auth) return auth.response;
  const parsed = await parseBody(req);
  if ('response' in parsed) return parsed.response;

  const user = await findUserByEmail(parsed.body.email);
  if (!user) return apiError('No user with that email', 404);
  if (!user.active) return apiError('User account is disabled', 409);
  const resolved = await resolvePracticeExam(parsed.body.exam);
  if ('response' in resolved) return resolved.response;
  const { exam } = resolved;

  const alreadyHadAccess = await hasPracticeAccess(db, user.id, exam.examId);
  const existing = await db.entitlement.findUnique({
    where: { userId_examId_tier: { userId: user.id, examId: exam.examId, tier: 'ADMIN_GRANT' } },
    select: { id: true }
  });
  if (!existing) {
    await db.entitlement.create({ data: { userId: user.id, examId: exam.examId, tier: 'ADMIN_GRANT' } });
    await db.adminLog.create({
      data: {
        adminId: auth.adminId,
        action: 'user.regrant',
        targetType: 'User',
        targetId: user.id,
        metadata: { examId: exam.examId, via: 'api', apiTokenId: auth.token.id, apiTokenName: auth.token.name }
      }
    });
  }
  return NextResponse.json(
    { ok: true, created: !existing, alreadyHadAccess, user, practiceExam: exam },
    { status: existing ? 200 : 201 }
  );
}

/**
 * DELETE /api/v1/assignments { email, exam } — remove an ADMIN_GRANT. Paid
 * access (PRACTICE / VOUCHER orders) is never touched; `stillHasAccess`
 * reports whether the user keeps the exam through a purchase.
 */
export async function DELETE(req: Request) {
  const auth = await requireApiToken(req, SCOPE_ASSIGN_PRACTICE_EXAMS);
  if ('response' in auth) return auth.response;
  const parsed = await parseBody(req);
  if ('response' in parsed) return parsed.response;

  const user = await findUserByEmail(parsed.body.email);
  if (!user) return apiError('No user with that email', 404);
  const resolved = await resolvePracticeExam(parsed.body.exam);
  if ('response' in resolved) return resolved.response;
  const { exam } = resolved;

  const examIds = await poolAccessExamIds(db, exam.examId);
  const { count } = await db.entitlement.deleteMany({
    where: { userId: user.id, examId: { in: examIds }, tier: 'ADMIN_GRANT' }
  });
  if (count) {
    await db.adminLog.create({
      data: {
        adminId: auth.adminId,
        action: 'user.revoke_grant',
        targetType: 'User',
        targetId: user.id,
        metadata: { examId: exam.examId, removed: count, via: 'api', apiTokenId: auth.token.id, apiTokenName: auth.token.name }
      }
    });
  }
  const stillHasAccess = await hasPracticeAccess(db, user.id, exam.examId);
  return NextResponse.json({ ok: true, removed: count, stillHasAccess, user, practiceExam: exam });
}
