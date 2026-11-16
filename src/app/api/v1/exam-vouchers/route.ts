import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SCOPE_VOUCHERS_WRITE, requireApiToken } from '@/lib/api-v1';
import { listVoucherRows } from '@/lib/voucher-pricing';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/exam-vouchers — every Exam Voucher that has a price (on or off
 * sale): current selling price, official pages to read the list price from,
 * and the last price check. For the weekly exam-voucher-pricer agent.
 */
export async function GET(req: Request) {
  const auth = await requireApiToken(req, SCOPE_VOUCHERS_WRITE);
  if ('response' in auth) return auth.response;
  return NextResponse.json({ currency: 'USD', vouchers: await listVoucherRows(db) });
}
