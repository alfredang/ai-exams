import { NextResponse } from 'next/server';
import { apiError, SCOPE_DB_READ } from '@/lib/api-v1';
import { runQuery } from '@/lib/db-api';
import { audit, dbApiAuth, dbError, readJson } from '../_shared';

export const dynamic = 'force-dynamic';

/** POST { sql: 'SELECT …', params?: [], limit?: 200 } → { rows, rowCount, truncated, ms }. Read-only. */
export async function POST(req: Request) {
  const auth = await dbApiAuth(req, SCOPE_DB_READ, 120);
  if ('response' in auth) return auth.response;
  const body = await readJson(req);
  if (!body) return apiError('Send a JSON body: { sql, params?, limit? }', 400);
  try {
    const res = await runQuery({ sql: body.sql, params: body.params, limit: body.limit });
    await audit(auth.adminId, auth.tokenId, 'db.query', { sql: String(body.sql).slice(0, 2000), rows: res.rowCount });
    return NextResponse.json(res);
  } catch (e) {
    await audit(auth.adminId, auth.tokenId, 'db.query', { sql: String(body.sql).slice(0, 2000), error: e instanceof Error ? e.message.slice(0, 300) : 'failed' });
    return dbError(e);
  }
}
