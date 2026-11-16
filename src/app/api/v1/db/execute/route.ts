import { NextResponse } from 'next/server';
import { apiError, SCOPE_DB_WRITE } from '@/lib/api-v1';
import { runExecute } from '@/lib/db-api';
import { audit, dbApiAuth, dbError, readJson } from '../_shared';

export const dynamic = 'force-dynamic';

/**
 * POST { sql: 'UPDATE … WHERE …', params?: [], maxAffected?: 100, dryRun?: false }
 * → { verb, affected, committed, dryRun, rows (with RETURNING), ms }.
 * More rows than maxAffected → 409 and nothing is changed.
 */
export async function POST(req: Request) {
  const auth = await dbApiAuth(req, SCOPE_DB_WRITE, 30);
  if ('response' in auth) return auth.response;
  const body = await readJson(req);
  if (!body) return apiError('Send a JSON body: { sql, params?, maxAffected?, dryRun? }', 400);
  const meta = { sql: String(body.sql).slice(0, 2000), params: Array.isArray(body.params) ? body.params.slice(0, 20) : undefined };
  try {
    const res = await runExecute({ sql: body.sql, params: body.params, maxAffected: body.maxAffected, dryRun: body.dryRun });
    await audit(auth.adminId, auth.tokenId, res.dryRun ? 'db.execute_dry_run' : 'db.execute', { ...meta, affected: res.affected, committed: res.committed });
    return NextResponse.json(res);
  } catch (e) {
    await audit(auth.adminId, auth.tokenId, 'db.execute', { ...meta, committed: false, error: e instanceof Error ? e.message.slice(0, 300) : 'failed' });
    return dbError(e);
  }
}
