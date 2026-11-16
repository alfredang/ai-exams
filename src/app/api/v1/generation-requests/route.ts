import { NextResponse } from 'next/server';
import { SCOPE_QUESTIONS_WRITE, requireApiToken } from '@/lib/api-v1';
import { claimableWhere, listGenerationRequests } from '@/lib/generation-requests';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/generation-requests — requests a worker may claim (queued, or
 * running with no update for 20 minutes), oldest first. `?all=1` lists the
 * latest 50 in any state.
 */
export async function GET(req: Request) {
  const auth = await requireApiToken(req, SCOPE_QUESTIONS_WRITE);
  if ('response' in auth) return auth.response;
  const all = new URL(req.url).searchParams.get('all') === '1';
  const rows = await listGenerationRequests(all ? {} : claimableWhere(), 50);
  return NextResponse.json({ requests: all ? rows : rows.reverse() });
}
