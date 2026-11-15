/**
 * Background answer-key check over the question pool (OpenAI gpt-6.1-sol).
 *
 * Walks every PUBLISHED question with no `aiCheckedAt` (one bank, or all of
 * them), BATCH questions of one exam per model call, CONCURRENCY calls in
 * flight, and applies `checkAnswerKeys()`: keys are fixed only on a
 * high-confidence disagreement, explanations rewritten for the right answer,
 * and every question is stamped with `aiCheckedAt` + `aiCheck`.
 *
 * Runs inside the web server process. Its on/off state lives in AdminLog
 * (`question.answer_check.start` / `.stop` / `.done`), so after a redeploy
 * `resumeAnswerCheckIfActive()` (called from src/instrumentation.ts) picks it
 * up where it left off — progress is the per-question `aiCheckedAt`.
 */
import { db } from '@/lib/db';
import { qaProvider, isRateLimit } from '@/lib/openai';
import { checkAnswerKeys, type CheckQuestion } from '@/lib/answer-check';
import { examBaseTitle } from '@/lib/exam-title';

const BATCH = 8;
const CONCURRENCY = 3;
const MAX_CONSECUTIVE_FAILURES = 6;
const LOG_ACTIONS = ['question.answer_check.start', 'question.answer_check.stop', 'question.answer_check.done'];

export type AnswerCheckRun = {
  running: boolean;
  examId: string | null;
  startedAt: string | null;
  checked: number;
  ok: number;
  fixed: number;
  unsure: number;
  skipped: number;
  lastError: string | null;
};

type State = AnswerCheckRun & { stop: boolean; inFlight: Set<string>; failed: Set<string>; adminId: string | null };

const g = globalThis as unknown as { __answerCheck?: State };
const state: State = (g.__answerCheck ??= {
  running: false,
  examId: null,
  startedAt: null,
  checked: 0,
  ok: 0,
  fixed: 0,
  unsure: 0,
  skipped: 0,
  lastError: null,
  stop: false,
  inFlight: new Set(),
  failed: new Set(),
  adminId: null
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Next batch: up to BATCH unchecked published questions from one exam. */
async function claim(): Promise<{ exam: { vendor: string; title: string; code: string }; questions: CheckQuestion[] } | null> {
  const skip = [...state.inFlight, ...state.failed];
  const where = {
    status: 'PUBLISHED' as const,
    aiCheckedAt: null,
    ...(state.examId ? { examId: state.examId } : {}),
    ...(skip.length ? { id: { notIn: skip } } : {})
  };
  const first = await db.question.findFirst({ where, orderBy: [{ examId: 'asc' }, { id: 'asc' }], select: { examId: true } });
  if (!first) return null;
  const rows = await db.question.findMany({
    where: { ...where, examId: first.examId },
    orderBy: { id: 'asc' },
    take: BATCH,
    select: { id: true, type: true, stem: true, domain: true, options: true, correct: true, references: true, exam: { select: { title: true, code: true, vendor: { select: { name: true } } } } }
  });
  if (!rows.length) return null;
  rows.forEach((r) => state.inFlight.add(r.id));
  const e = rows[0].exam;
  return {
    exam: { vendor: e.vendor.name, title: examBaseTitle(e.title), code: e.code },
    questions: rows.map((r) => ({
      id: r.id,
      type: r.type,
      stem: r.stem,
      domain: r.domain,
      options: (Array.isArray(r.options) ? r.options : []) as { id: string; text: string }[],
      correct: (Array.isArray(r.correct) ? r.correct : []) as string[],
      references: r.references
    }))
  };
}

async function processBatch(batch: NonNullable<Awaited<ReturnType<typeof claim>>>): Promise<void> {
  const { results, generatedBy } = await checkAnswerKeys(
    batch.questions.filter((q) => q.options.length >= 2 && q.correct.length > 0 && q.type !== 'HOTSPOT'),
    { vendor: batch.exam.vendor, certification: batch.exam.title, examCode: batch.exam.code }
  );
  const now = new Date();
  for (const q of batch.questions) {
    const r = results.get(q.id) ?? { verdict: 'skipped' as const, correct: q.correct, explanation: null, references: null, note: 'not checkable (no options or key)' };
    const before = await db.question.findUnique({ where: { id: q.id }, select: { correct: true, explanation: true, references: true, aiCheckedAt: true } });
    if (!before || before.aiCheckedAt) continue; // deleted, or checked by someone else meanwhile
    await db.question.update({
      where: { id: q.id },
      data: {
        ...(r.verdict === 'fixed' ? { correct: r.correct } : {}),
        ...(r.explanation ? { explanation: r.explanation } : {}),
        ...(r.references ? { references: r.references } : {}),
        aiCheckedAt: now,
        aiCheck: {
          verdict: r.verdict,
          model: generatedBy,
          note: r.note || undefined,
          at: now.toISOString(),
          // Kept so an admin can see (and restore) what the check replaced.
          before: r.verdict === 'fixed' || r.explanation ? { correct: before.correct, explanation: before.explanation } : undefined
        } as any
      }
    });
    if (r.verdict === 'fixed' && state.adminId) {
      await db.adminLog.create({
        data: {
          adminId: state.adminId,
          action: 'question.ai_key_fix',
          targetType: 'Question',
          targetId: q.id,
          metadata: { before: before.correct as any, after: r.correct, note: r.note, model: generatedBy }
        }
      });
    }
    state.checked++;
    state[r.verdict]++;
  }
}

async function loop(): Promise<void> {
  let failures = 0;
  const worker = async () => {
    while (!state.stop) {
      const batch = await claim();
      if (!batch) return;
      try {
        await processBatch(batch);
        failures = 0;
      } catch (e: any) {
        if (isRateLimit(e)) {
          state.lastError = `Rate limited — waiting a minute (${String(e?.message ?? e).slice(0, 160)})`;
          await sleep(60_000);
        } else {
          failures++;
          state.lastError = String(e?.message ?? e).slice(0, 300);
          batch.questions.forEach((q) => state.failed.add(q.id));
          if (failures >= MAX_CONSECUTIVE_FAILURES) state.stop = true;
          await sleep(5_000);
        }
      } finally {
        batch.questions.forEach((q) => state.inFlight.delete(q.id));
      }
    }
  };
  try {
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  } finally {
    const finished = !state.stop;
    state.running = false;
    if (finished && state.adminId) {
      await db.adminLog
        .create({
          data: {
            adminId: state.adminId,
            action: 'question.answer_check.done',
            targetType: state.examId ? 'Exam' : 'Question',
            targetId: state.examId ?? 'all',
            metadata: { checked: state.checked, ok: state.ok, fixed: state.fixed, unsure: state.unsure, skipped: state.skipped, failed: state.failed.size }
          }
        })
        .catch(() => {});
    }
  }
}

function launch(adminId: string, examId: string | null): void {
  Object.assign(state, {
    running: true,
    stop: false,
    examId,
    adminId,
    startedAt: new Date().toISOString(),
    checked: 0,
    ok: 0,
    fixed: 0,
    unsure: 0,
    skipped: 0,
    lastError: null
  });
  state.failed.clear();
  void loop().catch((e) => {
    state.running = false;
    state.lastError = String(e?.message ?? e).slice(0, 300);
  });
}

/** Start checking every unchecked published question (one bank, or all). */
export async function startAnswerCheck(adminId: string, examId: string | null, via: 'admin' | 'deploy' = 'admin'): Promise<AnswerCheckRun> {
  if (state.running) return answerCheckRun();
  if (!(await qaProvider())) throw new Error('Add an OpenAI API key under Settings → Credentials first.');
  await db.adminLog.create({
    data: { adminId, action: 'question.answer_check.start', targetType: examId ? 'Exam' : 'Question', targetId: examId ?? 'all', metadata: { examId, via } }
  });
  launch(adminId, examId);
  return answerCheckRun();
}

export async function stopAnswerCheck(adminId: string): Promise<AnswerCheckRun> {
  state.stop = true;
  await db.adminLog.create({
    data: { adminId, action: 'question.answer_check.stop', targetType: 'Question', targetId: state.examId ?? 'all', metadata: { checked: state.checked, fixed: state.fixed } }
  });
  return answerCheckRun();
}

export function answerCheckRun(): AnswerCheckRun {
  const { stop: _s, inFlight: _i, failed: _f, adminId: _a, ...run } = state;
  return { ...run };
}

/** Called on server boot: resume a check that was running when the server stopped. */
export async function resumeAnswerCheckIfActive(): Promise<void> {
  if (state.running) return;
  const last = await db.adminLog.findFirst({
    where: { action: { in: LOG_ACTIONS } },
    orderBy: { createdAt: 'desc' },
    select: { action: true, adminId: true, metadata: true }
  });
  if (last?.action !== 'question.answer_check.start' || !last.adminId) return;
  if (!(await qaProvider())) return;
  const examId = ((last.metadata as any)?.examId as string | null) ?? null;
  launch(last.adminId, examId);
}

/** Pool-wide (or one bank's) progress from the database, for the admin panel. */
export async function answerCheckProgress(examId?: string | null) {
  const scope = { status: 'PUBLISHED' as const, ...(examId ? { examId } : {}) };
  const [total, checked, fixed, unsure] = await Promise.all([
    db.question.count({ where: scope }),
    db.question.count({ where: { ...scope, aiCheckedAt: { not: null } } }),
    db.question.count({ where: { ...scope, aiCheck: { path: ['verdict'], equals: 'fixed' } } }),
    db.question.count({ where: { ...scope, aiCheck: { path: ['verdict'], equals: 'unsure' } } })
  ]);
  return { total, checked, fixed, unsure };
}
