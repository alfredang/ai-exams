import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiError, requireApiToken } from '@/lib/api-v1';
import { DbApiError } from '@/lib/db-api';
import { rateLimit } from '@/lib/ratelimit';

/** Token + per-token rate limit + JSON body for the /api/v1/db/* routes. */
export async function dbApiAuth(req: Request, scope: string, perMinute: number) {
  const auth = await requireApiToken(req, scope);
  if ('response' in auth) return { response: auth.response };
  const rl = rateLimit(`api-v1:db:${auth.token.id}`, perMinute, 60_000);
  if (!rl.ok) return { response: apiError('Too many requests', 429, { retryAfter: rl.retryAfter }) };
  return { adminId: auth.adminId, tokenId: auth.token.id };
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  if (!(req.headers.get('content-type') || '').includes('application/json')) return null;
  const body = await req.json().catch(() => null);
  return body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
}

export async function audit(adminId: string, tokenId: string, action: string, metadata: Record<string, unknown>) {
  await db.adminLog
    .create({ data: { adminId, action, targetType: 'Database', targetId: tokenId, metadata: { via: 'api', ...metadata } as object } })
    .catch(() => {});
}

export function dbError(e: unknown) {
  if (e instanceof DbApiError) return apiError(e.message, e.status);
  console.error('[api/v1/db]', e);
  return NextResponse.json({ error: 'Database API failed' }, { status: 500 });
}
