/**
 * Agent queue for the AI Q&A Generator — the path used when no OpenAI API key
 * is saved. An admin's request (exam, source, mode, count, types, domains) is
 * stored as a GenerationRequest; a worker on the agent machine
 * (~/DigitalWorkforce/bin/exam-generation-worker.py) claims it over
 * /api/v1/generation-requests and runs two models on local sign-ins:
 *
 *   writer   gpt-6.1-sol through the Codex CLI ("Sign in with ChatGPT")
 *   checker  Claude Opus through the Claude CLI, answering each question
 *
 * The worker only runs models. Prompts, JSON schemas, validation, the
 * answer-key comparison and publishing all stay here, so a question reaches
 * the pool under the same rules as the OpenAI path — with one stricter rule:
 * only a question the checker AGREES with is published (never "fixed").
 * `autoPublish` (default true) publishes straight into the pool; false saves
 * the questions as DRAFT ("Awaiting review") for an admin to publish by hand.
 */
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { zodTextFormat } from 'openai/helpers/zod';
import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { matchDomain, parseDomains, type BlueprintDomain } from '@/lib/question-pool';
import { BatchSchema, GEN_KINDS, GEN_SYSTEM, buildBatchPrompt, planDomainCounts, screenBatch, validate, type BatchInput, type GenKind, type GenMode } from '@/lib/ai-question-gen';
import { CHECK_SYSTEM, CheckReplySchema, applyCheckReply, buildCheckInput, type CheckQuestion } from '@/lib/answer-check';
import { chunkBySection } from '@/lib/sources/chunk';

export const BATCH = 5; // new questions per model call
export const EXTRACT_BATCH = 20; // extracted questions per excerpt
/** A RUNNING request with no update for this long can be claimed again. */
const STALE_MS = 20 * 60_000;
const MAX_NOTES = 40;

export const GENERATION_STATUSES = ['QUEUED', 'RUNNING', 'DONE', 'FAILED', 'CANCELLED'] as const;
export type GenerationStatus = (typeof GENERATION_STATUSES)[number];

export const normStem = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export type GenJob = { domains: string[]; count: number; excerpt?: string };

/**
 * The work list for one run: per-domain batches (AI generation), one batch
 * per excerpt (extract), or the total spread over the excerpts (generate from
 * a source). Deterministic for the same inputs, so the agent endpoints can
 * rebuild it on every call instead of storing it.
 */
export function planJobs(opts: {
  chosen: BlueprintDomain[];
  count: number;
  mode: GenMode;
  sourceText?: string | null;
}): { jobs: GenJob[]; plan: Record<string, number> } {
  const names = opts.chosen.map((d) => d.name);
  const jobs: GenJob[] = [];
  let plan: Record<string, number> = {};
  if (!opts.sourceText) {
    plan = planDomainCounts(opts.chosen, opts.count);
    for (const [domain, n] of Object.entries(plan)) {
      for (let left = n; left > 0; left -= BATCH) jobs.push({ domains: [domain], count: Math.min(BATCH, left) });
    }
  } else if (opts.mode === 'extract') {
    for (const excerpt of chunkBySection(opts.sourceText, 3000)) jobs.push({ domains: names, count: EXTRACT_BATCH, excerpt });
  } else {
    // Spread the total over the excerpts by length; tiny totals use evenly spaced excerpts.
    const chunks = chunkBySection(opts.sourceText, 5000);
    const picked = chunks.length > opts.count ? chunks.filter((_, i) => i % Math.ceil(chunks.length / opts.count) === 0).slice(0, opts.count) : chunks;
    const total = picked.reduce((s, c) => s + c.length, 0);
    let left = opts.count;
    picked.forEach((excerpt, i) => {
      const n = i === picked.length - 1 ? left : Math.min(left, Math.max(1, Math.round((opts.count * excerpt.length) / total)));
      left -= n;
      for (let k = n; k > 0; k -= BATCH) jobs.push({ domains: names, count: Math.min(BATCH, k), excerpt });
    });
  }
  return { jobs, plan };
}

/** GitHub hosts: question repos are often copied exam content, so extracts are always rephrased. */
export function isGithubUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === 'github.com' || host.endsWith('.github.com') || host === 'raw.githubusercontent.com' || host.endsWith('.github.io');
  } catch {
    return false;
  }
}

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

/** Everything the agent endpoints need about one request, rebuilt per call. */
async function loadContext(id: string) {
  const request = await db.generationRequest.findUnique({
    where: { id },
    include: {
      exam: { include: { vendor: { select: { name: true } } } },
      source: { select: { id: true, kind: true, label: true, content: true } }
    }
  });
  if (!request) return null;
  const blueprint = parseDomains(request.exam.domains);
  const wanted = strings(request.domains);
  const chosen = blueprint.length ? (wanted.length ? blueprint.filter((d) => wanted.includes(d.name)) : blueprint) : [{ name: 'General', weight: 1 }];
  const types = strings(request.types).filter((t): t is GenKind => (GEN_KINDS as string[]).includes(t));
  const mode: GenMode = request.mode === 'extract' ? 'extract' : 'generate';
  const { jobs, plan } = planJobs({ chosen, count: request.count, mode, sourceText: request.source?.content });
  const batchInput = (job: GenJob, avoid: string[]): BatchInput => ({
    vendor: request.exam.vendor.name,
    certification: request.exam.title,
    examCode: request.exam.code,
    blueprint,
    domains: job.domains,
    count: Math.min(job.count, Math.max(1, request.count - request.created)),
    types,
    avoid,
    source: job.excerpt && request.source ? { label: request.source.label, text: job.excerpt, mode, rephrase: request.rephrase } : undefined
  });
  return { request, blueprint, chosen, types, mode, jobs, plan, batchInput };
}

export class QueueError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

async function appendNotes(id: string, current: unknown, add: string[]) {
  const have = strings(current);
  // The same note again (e.g. "sign-in expired" on every poll) is not news.
  add = add.map((n) => n.slice(0, 300)).filter((n) => !have.includes(n));
  if (!add.length) return;
  const notes = [...have, ...add].slice(-MAX_NOTES);
  await db.generationRequest.update({ where: { id }, data: { notes } });
}

/** Rows for the admin panel and the agent's list. */
export async function listGenerationRequests(where: Prisma.GenerationRequestWhereInput, take = 20) {
  const rows = await db.generationRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take,
    select: {
      id: true,
      examId: true,
      status: true,
      phase: true,
      mode: true,
      rephrase: true,
      autoPublish: true,
      count: true,
      created: true,
      dropped: true,
      notes: true,
      error: true,
      worker: true,
      createdAt: true,
      updatedAt: true,
      finishedAt: true,
      exam: { select: { code: true, title: true } },
      source: { select: { kind: true, label: true } }
    }
  });
  return rows.map((r) => ({
    id: r.id,
    examId: r.examId,
    examCode: r.exam.code,
    examTitle: r.exam.title,
    status: r.status as GenerationStatus,
    phase: r.phase,
    mode: r.mode,
    rephrase: r.rephrase,
    autoPublish: r.autoPublish,
    count: r.count,
    created: r.created,
    dropped: r.dropped,
    notes: strings(r.notes),
    error: r.error,
    worker: r.worker,
    source: r.source ? { kind: r.source.kind, label: r.source.label } : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    finishedAt: r.finishedAt?.toISOString() ?? null
  }));
}
export type GenerationRequestRow = Awaited<ReturnType<typeof listGenerationRequests>>[number];

/** Requests a worker may claim: queued, or running with no update for 20 minutes. */
export const claimableWhere = (): Prisma.GenerationRequestWhereInput => ({
  OR: [{ status: 'QUEUED' }, { status: 'RUNNING', updatedAt: { lt: new Date(Date.now() - STALE_MS) } }]
});

/**
 * Claim a request for a worker and hand it the prompts to run. The guard in
 * the update makes two workers racing for one request safe.
 */
export async function claimGenerationRequest(id: string, worker: string) {
  const won = await db.generationRequest.updateMany({
    where: { id, ...claimableWhere() },
    data: { status: 'RUNNING', worker, claimedAt: new Date(), phase: 'Writing questions', error: null }
  });
  if (!won.count) throw new QueueError('This request is not waiting for a worker', 409);
  const ctx = await loadContext(id);
  if (!ctx) throw new QueueError('Request not found', 404);
  const existing = await db.question.findMany({ where: { examId: ctx.request.examId }, select: { stem: true, domain: true }, orderBy: { createdAt: 'desc' } });
  const stemsFor = (domains: string[]) =>
    existing.filter((q) => domains.includes((ctx.blueprint.length ? matchDomain(q.domain, ctx.blueprint) : q.domain) ?? '')).map((q) => q.stem).slice(0, 40);
  return {
    request: {
      id: ctx.request.id,
      count: ctx.request.count,
      created: ctx.request.created,
      mode: ctx.mode,
      rephrase: ctx.request.rephrase,
      types: ctx.types,
      domains: ctx.chosen.map((d) => d.name)
    },
    exam: { id: ctx.request.examId, code: ctx.request.exam.code, title: ctx.request.exam.title, vendor: ctx.request.exam.vendor.name },
    source: ctx.request.source ? { kind: ctx.request.source.kind, label: ctx.request.source.label } : null,
    writer: { instructions: GEN_SYSTEM, schema: zodTextFormat(BatchSchema, 'practice_questions').schema },
    checker: { instructions: CHECK_SYSTEM, schema: zodTextFormat(CheckReplySchema, 'answer_key_check').schema },
    jobs: ctx.jobs.map((job, index) => ({ index, count: job.count, input: buildBatchPrompt(ctx.batchInput(job, stemsFor(job.domains))) }))
  };
}

const CandidateSchema = z.object({
  domain: z.string(),
  type: z.enum(['SINGLE', 'MULTI', 'TRUE_FALSE', 'ORDERING']),
  stem: z.string(),
  options: z.array(z.object({ id: z.string(), text: z.string() })),
  correct: z.array(z.string()),
  explanation: z.string(),
  difficulty: z.number().int(),
  references: z.array(z.object({ label: z.string(), url: z.string() }))
});
export type Candidate = z.infer<typeof CandidateSchema>;
export const CandidatesSchema = z.array(CandidateSchema).max(EXTRACT_BATCH);

/**
 * Put a choice question's options in random order (ids stay a, b, c… by
 * position). A writer asked for one question at a time keeps choosing the
 * same letter — a CCAR-P test run keyed all seven on C. Safe here because
 * the published explanation is the checker's, written after the shuffle.
 * Left alone: true/false, sequencing, and options that refer to each other.
 */
export function shuffleOptions<T extends Candidate>(q: T, random: () => number = Math.random): T {
  if (q.type !== 'SINGLE' && q.type !== 'MULTI') return q;
  if (q.options.some((o) => /\b(all|none|both|any|neither) of the (above|below)\b|\b(option|answer|choice)s? [a-f]\b|\bboth [a-f] and [a-f]\b/i.test(o.text))) return q;
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const letters = 'abcdefgh';
  const idMap = new Map(order.map((from, to) => [q.options[from].id, letters[to]]));
  return {
    ...q,
    options: order.map((from, to) => ({ id: letters[to], text: q.options[from].text })),
    correct: q.correct.map((id) => idMap.get(id) ?? id).sort()
  };
}

const toCheck = (c: Candidate, id: string): CheckQuestion => ({ id, type: c.type, stem: c.stem, domain: c.domain, options: c.options, correct: c.correct, references: c.references });

async function runningContext(id: string) {
  const ctx = await loadContext(id);
  if (!ctx) throw new QueueError('Request not found', 404);
  if (ctx.request.status !== 'RUNNING') throw new QueueError(`Request is ${ctx.request.status}, not RUNNING — stop working on it`, 409);
  return ctx;
}

/**
 * Step 2 of a batch: the writer's raw reply is screened (type, domain,
 * validate(), repeats of a stem already in the bank) and the surviving
 * candidates come back with the checker's prompt.
 */
export async function screenWriterReply(id: string, jobIndex: number, output: unknown) {
  const ctx = await runningContext(id);
  const job = ctx.jobs[jobIndex];
  if (!job) throw new QueueError(`No job ${jobIndex} in this request`, 400);
  const remaining = ctx.request.count - ctx.request.created;
  if (remaining <= 0) return { candidates: [] as Candidate[], rejected: [] as string[], check: null, remaining: 0 };
  const parsed = BatchSchema.safeParse(output);
  if (!parsed.success) {
    const reason = `writer reply had the wrong shape (${parsed.error.issues[0]?.path.join('.')} ${parsed.error.issues[0]?.message})`;
    await db.generationRequest.update({ where: { id }, data: { dropped: { increment: 1 } } });
    await appendNotes(id, ctx.request.notes, [reason]);
    return { candidates: [] as Candidate[], rejected: [reason], check: null, remaining };
  }
  const { valid, rejected } = screenBatch(parsed.data, ctx.batchInput(job, []));
  const existing = await db.question.findMany({ where: { examId: ctx.request.examId }, select: { stem: true } });
  const seen = new Set(existing.map((q) => normStem(q.stem)));
  const candidates: Candidate[] = [];
  for (const q of valid) {
    const key = normStem(q.stem);
    if (seen.has(key)) {
      rejected.push('duplicate of a question already in the bank');
      continue;
    }
    seen.add(key);
    if (candidates.length < remaining) candidates.push(shuffleOptions(q));
  }
  if (rejected.length) {
    await db.generationRequest.update({ where: { id }, data: { dropped: { increment: rejected.length }, phase: 'Checking answers' } });
    await appendNotes(id, ctx.request.notes, [`skipped ${rejected.length} (${[...new Set(rejected)].join('; ')})`]);
  } else {
    await db.generationRequest.update({ where: { id }, data: { phase: 'Checking answers' } });
  }
  const check = candidates.length
    ? {
        input: buildCheckInput(
          candidates.map((c, i) => toCheck(c, `new-${i}`)),
          { vendor: ctx.request.exam.vendor.name, certification: ctx.request.exam.title, examCode: ctx.request.exam.code }
        )
      }
    : null;
  return { candidates, rejected, check, remaining };
}

/**
 * Step 3 of a batch: the checker's reply is applied to the candidates and
 * only those it agrees with are published. Candidates are re-validated here —
 * they were echoed back by the worker.
 */
export async function publishCheckedBatch(
  id: string,
  input: { candidates: Candidate[]; checkOutput?: unknown; writer: string; checker: string; adminId: string }
) {
  const ctx = await runningContext(id);
  const reply = CheckReplySchema.safeParse(input.checkOutput);
  if (!reply.success) {
    const reason = `checker reply had the wrong shape — ${input.candidates.length} question(s) not published`;
    await db.generationRequest.update({ where: { id }, data: { dropped: { increment: input.candidates.length }, phase: 'Writing questions' } });
    await appendNotes(id, ctx.request.notes, [reason]);
    return { created: 0, dropped: input.candidates.length, reasons: [reason], total: ctx.request.created, remaining: ctx.request.count - ctx.request.created };
  }
  // Real ids up front: a sequencing answer lead depends on the question id.
  const ids = input.candidates.map(() => `gq${randomUUID().replace(/-/g, '')}`);
  const results = applyCheckReply(
    input.candidates.map((c, i) => toCheck(c, ids[i])),
    reply.data
  );
  const existing = await db.question.findMany({ where: { examId: ctx.request.examId }, select: { stem: true } });
  const seen = new Set(existing.map((q) => normStem(q.stem)));
  const allowed = ctx.chosen.map((d) => d.name);
  let remaining = ctx.request.count - ctx.request.created;
  let created = 0;
  const reasons: string[] = [];
  for (const [i, c] of input.candidates.entries()) {
    const check = results.get(ids[i]);
    const v = validate(c);
    if (typeof v === 'string') reasons.push(v);
    else if (!allowed.includes(c.domain)) reasons.push('domain not in this request');
    else if (seen.has(normStem(v.stem))) reasons.push('duplicate of a question already in the bank');
    else if (!check || check.verdict === 'skipped') reasons.push('answer not checked (unusable checker reply)');
    else if (check.verdict !== 'ok') reasons.push(`answer not confirmed (${check.note.slice(0, 120) || 'the checker disagreed with the key'})`);
    else if (remaining <= 0) reasons.push('over the requested number');
    else {
      seen.add(normStem(v.stem));
      await db.question.create({
        data: {
          id: ids[i],
          examId: ctx.request.examId,
          domain: c.domain,
          ...v,
          explanation: check.explanation ?? v.explanation,
          references: check.references ?? v.references,
          // Review mode holds the question as DRAFT ("Awaiting review") until an admin publishes it.
          status: ctx.request.autoPublish ? 'PUBLISHED' : 'DRAFT',
          generatedBy: `agent:generator:${input.writer}`,
          sourceId: ctx.request.sourceId,
          aiCheckedAt: new Date(),
          aiCheck: { verdict: 'ok', model: input.checker, at: new Date().toISOString() }
        }
      });
      created++;
      remaining--;
    }
  }
  const updated = await db.generationRequest.update({
    where: { id },
    data: { created: { increment: created }, dropped: { increment: reasons.length }, phase: 'Writing questions' },
    select: { created: true, count: true }
  });
  if (reasons.length) await appendNotes(id, ctx.request.notes, [`not published: ${reasons.length} (${[...new Set(reasons)].join('; ')})`]);
  if (created) revalidatePath(`/admin-dashboard/exams/${ctx.request.examId}`);
  return { created, dropped: reasons.length, reasons, total: updated.created, remaining: updated.count - updated.created };
}

/** Worker progress: a phase line, a note, or the final DONE / FAILED. */
export async function reportGenerationProgress(
  id: string,
  input: { phase?: string; note?: string; status?: 'DONE' | 'FAILED' | 'QUEUED'; error?: string; writer?: string; checker?: string; adminId: string }
) {
  const request = await db.generationRequest.findUnique({ where: { id }, select: { status: true, notes: true, examId: true, count: true, created: true, dropped: true, sourceId: true, mode: true } });
  if (!request) throw new QueueError('Request not found', 404);
  if (request.status !== 'RUNNING') throw new QueueError(`Request is ${request.status}, not RUNNING — stop working on it`, 409);
  if (input.note) await appendNotes(id, request.notes, [input.note]);
  if (!input.status) {
    // Always write, so `updatedAt` moves and the request isn't treated as stale.
    await db.generationRequest.update({ where: { id }, data: { phase: input.phase?.slice(0, 120) ?? undefined, updatedAt: new Date() } });
    return { status: 'RUNNING' as const };
  }
  if (input.status === 'QUEUED') {
    await db.generationRequest.update({ where: { id }, data: { status: 'QUEUED', phase: null, worker: null } });
    return { status: 'QUEUED' as const };
  }
  await db.generationRequest.update({
    where: { id },
    data: { status: input.status, phase: null, error: input.status === 'FAILED' ? (input.error ?? 'The worker stopped').slice(0, 600) : null, finishedAt: new Date() }
  });
  await db.adminLog.create({
    data: {
      adminId: input.adminId,
      action: 'question.agent_generate',
      targetType: 'Exam',
      targetId: request.examId,
      metadata: {
        via: 'api',
        requestId: id,
        status: input.status,
        requested: request.count,
        created: request.created,
        dropped: request.dropped,
        mode: request.mode,
        sourceId: request.sourceId,
        writer: input.writer ?? null,
        checker: input.checker ?? null,
        error: input.status === 'FAILED' ? (input.error ?? null) : null
      }
    }
  });
  revalidatePath(`/admin-dashboard/exams/${request.examId}`);
  revalidatePath('/admin-dashboard/exams');
  revalidatePath('/admin-dashboard/questions');
  return { status: input.status };
}
