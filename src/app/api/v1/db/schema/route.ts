import { NextResponse } from 'next/server';
import { SCOPE_DB_READ } from '@/lib/api-v1';
import { dbApiSchema } from '@/lib/db-api';
import { dbApiAuth, dbError } from '../_shared';

export const dynamic = 'force-dynamic';

/** GET ?table=User → every table the API can read, its columns, which are writable, and which are hidden. */
export async function GET(req: Request) {
  const auth = await dbApiAuth(req, SCOPE_DB_READ, 120);
  if ('response' in auth) return auth.response;
  try {
    const table = new URL(req.url).searchParams.get('table') || undefined;
    return NextResponse.json({ tables: await dbApiSchema(table) });
  } catch (e) {
    return dbError(e);
  }
}
