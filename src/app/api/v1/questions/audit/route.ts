import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { SCOPE_QUESTIONS_WRITE, apiError, requireApiToken } from '@/lib/api-v1';

export const dynamic = 'force-dynamic';

const Body = z.object({
  auditor: z.string().regex(/^[a-z0-9-]{3,40}$/).default('question-auditor'),
  model: z.string().regex(/^[a-z0-9.-]{3,60}$/).default('claude-opus-5-5'),
  results: z
    .array(
      z.object({
        id: z.string(),
        /** ok = fine; the others highlight the question in admin until fixed or cleared. */
        verdict: z.enum(['ok', 'wrong', 'outdated', 'ambiguous']),
        note: z.string().max(2000).default(''),
        /** For "wrong": the answer the auditor believes is right (option text or letters). */
        suggestedAnswer: z.string().max(500).optional(),
        sources: z.array(z.string().url()).max(5).default([])
      })
    )
    .min(1)
    .max(100)
});

/**
 * POST /api/v1/questions/audit — record audit verdicts. Never changes a
 * question's key or text: "wrong" / "outdated" / "ambiguous" set
 * `auditFlag`, which highlights the question in admin (Question Bank page,
 * "Audit flags" filter) until an admin edits it or clears the flag.
 */
export async function POST(req: Request) {
  const auth = await requireApiToken(req, SCOPE_QUESTIONS_WRITE);
  if ('response' in auth) return auth.response;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return apiError(`Bad request: ${parsed.error.issues[0]?.path.join('.')} ${parsed.error.issues[0]?.message}`, 400);
  const { auditor, model, results } = parsed.data;
  const now = new Date();
  let saved = 0;
  const flagged: string[] = [];
  const missing: string[] = [];
  for (const r of results) {
    const flag = r.verdict === 'ok' ? null : r.verdict;
    const res = await db.question.updateMany({
      where: { id: r.id },
      data: {
        auditedAt: now,
        auditFlag: flag,
        audit: { verdict: r.verdict, note: r.note || undefined, suggestedAnswer: r.suggestedAnswer, sources: r.sources, by: `agent:${auditor}:${model}`, at: now.toISOString() }
      }
    });
    if (!res.count) missing.push(r.id);
    else {
      saved++;
      if (flag) flagged.push(r.id);
    }
  }
  await db.adminLog.create({
    data: { adminId: auth.adminId, action: 'question.audit', targetType: 'Question', targetId: 'batch', metadata: { via: 'api', auditor, model, saved, flagged } }
  });
  return NextResponse.json({ saved, flagged: flagged.length, missing });
}
