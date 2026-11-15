import type { PrismaClient } from '@prisma/client';

/** generatedBy tags written by AI (the admin generator and older tools). */
export const AI_GENERATED_WHERE = {
  OR: [
    { generatedBy: { startsWith: 'openai:' } },
    { generatedBy: { startsWith: 'deepseek:' } },
    { generatedBy: { startsWith: 'minimax:' } },
    { generatedBy: { startsWith: 'claude' } },
    { generatedBy: { startsWith: 'gpt' } }
  ]
};

async function firstAdmin(db: PrismaClient): Promise<string | null> {
  const admin = await db.user.findFirst({ where: { role: 'ADMIN', active: true }, orderBy: { createdAt: 'asc' }, select: { id: true } });
  return admin?.id ?? null;
}

/**
 * One-time removal of the human review queue (2026-11-16), run from the boot
 * seed. AI-generated questions still awaiting review (DRAFT) are deleted —
 * or ARCHIVED when an earlier attempt drew them, so those results still open.
 * Any other DRAFT (rows unpublished before "Unpublish" meant ARCHIVED) becomes
 * ARCHIVED, i.e. "Unpublished". Its AdminLog entry is the run-once marker.
 */
export async function removeReviewQueueOnce(db: PrismaClient, runId: string): Promise<{ deleted: number; archived: number } | null> {
  if (await db.adminLog.findFirst({ where: { action: 'question.review_cleanup', targetId: runId }, select: { id: true } })) return null;
  const adminId = await firstAdmin(db);
  if (!adminId) return null;

  const aiDrafts = await db.question.findMany({ where: { status: 'DRAFT', ...AI_GENERATED_WHERE }, select: { id: true, examId: true } });
  const ids = aiDrafts.map((q) => q.id);
  const used = new Set<string>();
  if (ids.length) {
    const attempts = await db.attempt.findMany({ where: { questionIds: { hasSome: ids } }, select: { questionIds: true } });
    for (const a of attempts) for (const id of a.questionIds) used.add(id);
  }
  const doomed = ids.filter((id) => !used.has(id));
  const keep = ids.filter((id) => used.has(id));

  return db.$transaction(async (tx) => {
    const { count: deleted } = doomed.length ? await tx.question.deleteMany({ where: { id: { in: doomed }, status: 'DRAFT' } }) : { count: 0 };
    const { count: archivedAi } = keep.length ? await tx.question.updateMany({ where: { id: { in: keep } }, data: { status: 'ARCHIVED' } }) : { count: 0 };
    const { count: archivedOther } = await tx.question.updateMany({ where: { status: 'DRAFT' }, data: { status: 'ARCHIVED' } });
    const perExam: Record<string, number> = {};
    for (const q of aiDrafts) perExam[q.examId] = (perExam[q.examId] ?? 0) + 1;
    await tx.adminLog.create({
      data: {
        adminId,
        action: 'question.review_cleanup',
        targetType: 'Question',
        targetId: runId,
        metadata: { via: 'deploy', deletedAiDrafts: deleted, archivedAiDrafts: archivedAi, archivedOtherDrafts: archivedOther, perExam }
      }
    });
    return { deleted, archived: archivedAi + archivedOther };
  });
}

/**
 * Queue the pool-wide AI answer-key check once (2026-11-16). Writes the
 * `question.answer_check.start` marker; the web server picks it up on boot
 * (src/instrumentation.ts → resumeAnswerCheckIfActive) and works through every
 * unchecked published question. Admins can stop it on the AI Question and
 * Answer Generator page.
 */
export async function queueAnswerCheckOnce(db: PrismaClient, runId: string): Promise<boolean> {
  if (await db.adminLog.findFirst({ where: { action: 'question.answer_check.start', targetId: runId }, select: { id: true } })) return false;
  const adminId = await firstAdmin(db);
  if (!adminId) return false;
  await db.adminLog.create({
    data: { adminId, action: 'question.answer_check.start', targetType: 'Question', targetId: runId, metadata: { examId: null, via: 'deploy' } }
  });
  return true;
}
