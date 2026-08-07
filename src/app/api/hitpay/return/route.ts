import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Browser-side return URL after HitPay-hosted checkout. NOT the source of
// truth for fulfillment — that's the webhook. We just inspect the current
// order status and route the user accordingly.
export async function GET(req: Request) {
  const url = new URL(req.url);
  // Behind the reverse proxy req.url's origin is the internal container
  // address (e.g. https://<container-id>:3000) — never redirect a browser
  // there. Build redirects from APP_URL like the payment routes do.
  const appUrl = process.env.APP_URL || url.origin;
  const orderId = url.searchParams.get('orderId');
  if (!orderId) return NextResponse.redirect(new URL('/checkout/failed', appUrl));
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.redirect(new URL('/checkout/failed', appUrl));
  if (order.status === 'PAID') return NextResponse.redirect(new URL(`/checkout/success?orderId=${order.id}`, appUrl));
  if (order.status === 'FAILED') return NextResponse.redirect(new URL('/checkout/failed', appUrl));
  // Webhook may not have arrived yet. Show a processing page that polls.
  return NextResponse.redirect(new URL(`/checkout/processing?orderId=${orderId}`, appUrl));
}
