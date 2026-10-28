import { NextResponse } from 'next/server';
import { getUsdToSgdQuote } from '@/lib/fx';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Public: the USD→SGD rate the storefront currency switcher and PayNow use.
export async function GET() {
  const fx = await getUsdToSgdQuote();
  return NextResponse.json(
    fx ? { ok: true, base: 'USD', quote: 'SGD', bps: fx.bps, rate: fx.rate, source: fx.source, asOf: fx.asOf } : { ok: false },
    { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' } }
  );
}
