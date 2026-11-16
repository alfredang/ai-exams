import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SCOPE_QUESTIONS_WRITE, apiError, requireApiToken } from '@/lib/api-v1';
import { QueueError, claimGenerationRequest } from '@/lib/generation-requests';

export const dynamic = 'force-dynamic';

const Body = z.object({ worker: z.string().regex(/^[A-Za-z0-9._:-]{3,60}$/) });

/**
 * POST /api/v1/generation-requests/{id}/claim `{ worker }` — take a request
 * (409 if another worker has it) and receive the writer and checker system
 * prompts, their JSON Schemas and one writer prompt per job.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiToken(req, SCOPE_QUESTIONS_WRITE);
  if ('response' in auth) return auth.response;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return apiError('Bad request: worker is required', 400);
  try {
    return NextResponse.json(await claimGenerationRequest((await params).id, parsed.data.worker));
  } catch (e) {
    if (e instanceof QueueError) return apiError(e.message, e.status);
    throw e;
  }
}
