import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SCOPE_QUESTIONS_WRITE, apiError, requireApiToken } from '@/lib/api-v1';
import { QueueError, reportGenerationProgress } from '@/lib/generation-requests';

export const dynamic = 'force-dynamic';

const Model = z.string().regex(/^[a-z0-9.:-]{3,60}$/);
const Body = z.object({
  phase: z.string().max(120).optional(),
  note: z.string().max(300).optional(),
  /** QUEUED hands the request back (e.g. the writer's sign-in expired) for a later run. */
  status: z.enum(['DONE', 'FAILED', 'QUEUED']).optional(),
  error: z.string().max(600).optional(),
  writer: Model.optional(),
  checker: Model.optional()
});

/**
 * POST /api/v1/generation-requests/{id}/progress — a phase line or note
 * while working (also keeps the claim alive), or the final
 * `{ status: 'DONE' | 'FAILED', error? }`, or `{ status: 'QUEUED', note }` to
 * hand it back for a later run. 409 means the request was
 * cancelled or finished: stop working on it.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiToken(req, SCOPE_QUESTIONS_WRITE);
  if ('response' in auth) return auth.response;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return apiError(`Bad request: ${parsed.error.issues[0]?.path.join('.')} ${parsed.error.issues[0]?.message}`, 400);
  try {
    return NextResponse.json(await reportGenerationProgress((await params).id, { ...parsed.data, adminId: auth.adminId }));
  } catch (e) {
    if (e instanceof QueueError) return apiError(e.message, e.status);
    throw e;
  }
}
