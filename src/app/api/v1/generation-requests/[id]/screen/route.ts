import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SCOPE_QUESTIONS_WRITE, apiError, requireApiToken } from '@/lib/api-v1';
import { QueueError, screenWriterReply } from '@/lib/generation-requests';

export const dynamic = 'force-dynamic';

const Body = z.object({ jobIndex: z.number().int().min(0), output: z.unknown() });

/**
 * POST /api/v1/generation-requests/{id}/screen `{ jobIndex, output }` — the
 * writer model's raw reply for one job. Returns the candidates that passed
 * validation and the checker's prompt (`check.input`), or `check: null` when
 * nothing survived.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiToken(req, SCOPE_QUESTIONS_WRITE);
  if ('response' in auth) return auth.response;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return apiError('Bad request: jobIndex and output are required', 400);
  try {
    return NextResponse.json(await screenWriterReply((await params).id, parsed.data.jobIndex, parsed.data.output));
  } catch (e) {
    if (e instanceof QueueError) return apiError(e.message, e.status);
    throw e;
  }
}
