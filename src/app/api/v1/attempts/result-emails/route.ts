import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { apiError, requireApiToken, SCOPE_DB_WRITE, SCOPE_RESULTS_EMAIL } from '@/lib/api-v1';
import { resendResultEmails } from '@/lib/finalize-attempt';
import { rateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({ attemptIds: z.array(z.string().min(1)).min(1).max(50) });

/**
 * POST { attemptIds: [≤50] } → { sent, skipped, failed, results[] }.
 * (Re)sends the EXAM_RESULT score report (answer-review PDF attached) to the
 * candidate who owns each submitted attempt. Scope `results:email`; a
 * `db:write` token is accepted too (it can already change any attempt).
 * Audited as the token's admin, `attempt.result_email`, via 'api'.
 */
export async function POST(req: Request) {
  let auth = await requireApiToken(req, SCOPE_RESULTS_EMAIL);
  if (auth.response?.status === 403) auth = await requireApiToken(req, SCOPE_DB_WRITE);
  if (auth.response) return auth.response;
  const rl = rateLimit(`api-v1:result-emails:${auth.token.id}`, 10, 60_000);
  if (!rl.ok) return apiError('Too many requests', 429, { retryAfter: rl.retryAfter });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError('Send a JSON body: { attemptIds: [1 to 50 attempt ids] }', 400);
  const results = await resendResultEmails(parsed.data.attemptIds);

  await db.adminLog
    .create({
      data: {
        adminId: auth.adminId,
        action: 'attempt.result_email',
        targetType: 'Attempt',
        targetId: results.length === 1 ? results[0].attemptId : `${results.length} attempts`,
        metadata: JSON.parse(JSON.stringify({ via: 'api', tokenId: auth.token.id, results }))
      }
    })
    .catch(() => {});
  const count = (s: string) => results.filter((r) => r.status === s).length;
  return NextResponse.json({ ok: true, sent: count('sent'), skipped: count('skipped'), failed: count('failed'), results });
}
