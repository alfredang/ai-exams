import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { SCOPE_QUESTIONS_WRITE, apiError, requireApiToken, resolvePracticeExam } from '@/lib/api-v1';
import { createExamSource } from '@/lib/sources/create';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const Body = z.object({ kind: z.enum(['YOUTUBE', 'URL']), url: z.string().trim().min(8).max(2000) });
const MAX_RETURNED_CHARS = 200_000;

/**
 * POST /api/v1/question-banks/{slug|code|examId}/sources { kind, url } — read
 * a YouTube transcript or web page (through the server's fixed providers) and
 * store it as a source of that bank. Returns its id and text, so the agent
 * writes questions from it and posts them with `sourceId`.
 */
export async function POST(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const auth = await requireApiToken(req, SCOPE_QUESTIONS_WRITE);
  if ('response' in auth) return auth.response;
  const resolved = await resolvePracticeExam(decodeURIComponent((await params).ref));
  if ('response' in resolved) return resolved.response;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return apiError('Send { kind: "YOUTUBE" | "URL", url }', 400);
  try {
    const created = await createExamSource(db, { examId: resolved.exam.examId, adminId: auth.adminId, source: parsed.data });
    const row = await db.examSource.findUnique({ where: { id: created.id }, select: { content: true } });
    await db.adminLog.create({
      data: {
        adminId: auth.adminId,
        action: 'question.source_add',
        targetType: 'Exam',
        targetId: resolved.exam.examId,
        metadata: { via: 'api', sourceId: created.id, kind: created.kind, label: created.label, url: parsed.data.url, chars: created.chars }
      }
    });
    return NextResponse.json({ ...created, text: (row?.content ?? '').slice(0, MAX_RETURNED_CHARS), truncated: created.chars > MAX_RETURNED_CHARS });
  } catch (e: any) {
    return apiError(String(e?.message ?? 'Could not read that source').slice(0, 600), 422);
  }
}
