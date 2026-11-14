import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import {
  SCOPE_ASSIGN_PRACTICE_EXAMS,
  apiError,
  findUserByEmail,
  requireApiToken,
  resolvePracticeExam
} from '@/lib/api-v1';
import { isFullName, normalizeName } from '@/lib/full-name-rules';
import { hasPracticeAccess } from '@/lib/question-pool';

export const dynamic = 'force-dynamic';

const DEFAULT_REMARK = 'Registered from TMS';

const Body = z.object({
  name: z.string().trim().max(200).optional().default(''),
  email: z.string().trim().email().max(320),
  exam: z.string().min(1),
  courseRunId: z.string().trim().max(100).optional().default(''),
  remark: z.string().trim().max(200).optional(),
  sendWelcomeEmail: z.boolean().optional().default(true)
});

/**
 * POST /api/v1/registrations { name, email, exam, courseRunId?, remark?, sendWelcomeEmail? }
 *
 * The LMS/TMS registers a class's learners for the course's practice exam.
 * Unlike /assignments it creates the account when the email is new (with the
 * name, no password — the learner signs in with Google or an email code), then
 * grants ADMIN_GRANT and records the course run ID, register date and remark
 * on that grant. Idempotent: calling again for the same course run changes
 * nothing; a different course run updates the record.
 */
export async function POST(req: Request) {
  const auth = await requireApiToken(req, SCOPE_ASSIGN_PRACTICE_EXAMS);
  if ('response' in auth) return auth.response;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return apiError('Body must be JSON { "name": string, "email": string, "exam": string, "courseRunId"?: string }', 400);
  }
  const body = parsed.data;
  const email = body.email.toLowerCase();
  const name = normalizeName(body.name);
  const courseRunId = body.courseRunId || null;
  const remark = body.remark || DEFAULT_REMARK;

  const resolved = await resolvePracticeExam(body.exam);
  if ('response' in resolved) return resolved.response;
  const { exam } = resolved;
  const audit = { via: 'api', apiTokenId: auth.token.id, apiTokenName: auth.token.name, source: 'tms', courseRunId };

  let user = await findUserByEmail(email);
  let accountCreated = false;
  if (!user) {
    try {
      const created = await db.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: { email, name: name || 'user', role: 'USER', passwordSetupRequired: true },
          select: { id: true, email: true, name: true, active: true }
        });
        await tx.adminLog.create({
          data: { adminId: auth.adminId, action: 'user.create', targetType: 'User', targetId: u.id, metadata: audit }
        });
        return u;
      });
      user = created;
      accountCreated = true;
    } catch (error) {
      // Lost a race with a parallel call for the same email: use the account it made.
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) throw error;
      user = await findUserByEmail(email);
      if (!user) throw error;
    }
  } else if (isFullName(name) && !isFullName(user.name)) {
    // Fill in a missing/placeholder name; never overwrite a real one.
    user = await db.user.update({ where: { id: user.id }, data: { name }, select: { id: true, email: true, name: true, active: true } });
  }
  if (!user.active) return apiError('User account is disabled', 409);

  const alreadyHadAccess = accountCreated ? false : await hasPracticeAccess(db, user.id, exam.examId);
  const key = { userId_examId_tier: { userId: user.id, examId: exam.examId, tier: 'ADMIN_GRANT' as const } };
  const existing = await db.entitlement.findUnique({ where: key, select: { id: true, courseRunId: true, registeredAt: true, remark: true } });

  let grant = existing;
  let created = false;
  if (!existing) {
    grant = await db.entitlement.create({
      data: { userId: user.id, examId: exam.examId, tier: 'ADMIN_GRANT', courseRunId, registeredAt: new Date(), remark },
      select: { id: true, courseRunId: true, registeredAt: true, remark: true }
    });
    created = true;
    await db.adminLog.create({
      data: { adminId: auth.adminId, action: 'user.regrant', targetType: 'User', targetId: user.id, metadata: { examId: exam.examId, ...audit } }
    });
  } else if (existing.courseRunId !== courseRunId || !existing.registeredAt) {
    // A manual grant now registered by the TMS, or the learner joined another class.
    grant = await db.entitlement.update({
      where: { id: existing.id },
      data: { courseRunId, registeredAt: new Date(), remark },
      select: { id: true, courseRunId: true, registeredAt: true, remark: true }
    });
  }

  let welcomeEmailSent = false;
  if (accountCreated && body.sendWelcomeEmail) {
    const { sendWelcomeEmail } = await import('@/lib/mail');
    welcomeEmailSent = !!(await sendWelcomeEmail(user.id).catch(() => null));
  }

  return NextResponse.json(
    {
      ok: true,
      accountCreated,
      created,
      alreadyHadAccess,
      welcomeEmailSent,
      user,
      practiceExam: exam,
      registration: { courseRunId: grant!.courseRunId, registeredAt: grant!.registeredAt, remark: grant!.remark }
    },
    { status: created ? 201 : 200 }
  );
}

/**
 * GET /api/v1/registrations?courseRunId=<id>[&exam=<code|slug|id>]
 * Every learner registered for that course run, with the register date.
 */
export async function GET(req: Request) {
  const auth = await requireApiToken(req, SCOPE_ASSIGN_PRACTICE_EXAMS);
  if ('response' in auth) return auth.response;
  const params = new URL(req.url).searchParams;
  const courseRunId = (params.get('courseRunId') || '').trim();
  if (!courseRunId) return apiError('courseRunId is required', 400);

  let examId: string | undefined;
  const examRef = (params.get('exam') || '').trim();
  if (examRef) {
    const resolved = await resolvePracticeExam(examRef);
    if ('response' in resolved) return resolved.response;
    examId = resolved.exam.examId;
  }

  const rows = await db.entitlement.findMany({
    where: { courseRunId, tier: 'ADMIN_GRANT', ...(examId ? { examId } : {}) },
    orderBy: { registeredAt: 'asc' },
    select: {
      courseRunId: true,
      registeredAt: true,
      remark: true,
      examId: true,
      user: { select: { email: true, name: true, active: true, emailVerified: true } }
    }
  });
  return NextResponse.json({
    courseRunId,
    registrations: rows.map((r) => ({
      email: r.user.email,
      name: r.user.name,
      active: r.user.active,
      signedIn: !!r.user.emailVerified,
      examId: r.examId,
      courseRunId: r.courseRunId,
      registeredAt: r.registeredAt,
      remark: r.remark
    }))
  });
}
