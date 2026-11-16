import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SCOPE_QUESTIONS_WRITE, apiError, requireApiToken } from '@/lib/api-v1';
import { CandidatesSchema, QueueError, publishCheckedBatch } from '@/lib/generation-requests';

export const dynamic = 'force-dynamic';

const Model = z.string().regex(/^[a-z0-9.:-]{3,60}$/);
const Body = z.object({ candidates: CandidatesSchema, checkOutput: z.unknown(), writer: Model, checker: Model });

/**
 * POST /api/v1/generation-requests/{id}/publish
 * `{ candidates, checkOutput, writer, checker }` — the candidates from
 * /screen, unchanged and in the same order, with the checker model's raw
 * reply. Only questions the checker agrees with are published.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiToken(req, SCOPE_QUESTIONS_WRITE);
  if ('response' in auth) return auth.response;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return apiError(`Bad request: ${parsed.error.issues[0]?.path.join('.')} ${parsed.error.issues[0]?.message}`, 400);
  try {
    return NextResponse.json(await publishCheckedBatch((await params).id, { ...parsed.data, adminId: auth.adminId }));
  } catch (e) {
    if (e instanceof QueueError) return apiError(e.message, e.status);
    throw e;
  }
}
