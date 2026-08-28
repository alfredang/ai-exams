import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { fulfillOrder } from '@/lib/fulfill';
import { nextNumber } from '@/lib/numbering';

const Body = z.object({ bundleId: z.string() });

// Free-bundle claim endpoint. Lets a signed-in user claim a bundle
// whose price is 0 — no PayPal flow, no payment. Server-side verifies
// the bundle exists, is published, AND has price=0 (so this endpoint
// cannot be abused to bypass payment for paid bundles).
export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const { bundleId } = Body.parse(await req.json());
  const bundle = await db.bundle.findUnique({ where: { id: bundleId } });
  if (!bundle || !bundle.published) {
    return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
  }
  if (bundle.price !== 0) {
    return NextResponse.json({ error: 'This bundle is not free.' }, { status: 400 });
  }

  // Synthesise a paypalOrderId so the unique constraint holds — claims
  // are independent events (a user can re-claim and the upserts in
  // fulfillOrder no-op on existing entitlements).
  const syntheticPaypalId = `free-${userId}-${bundleId}-${Date.now()}`;
  const number = await nextNumber('ORDER', 'ORD');
  const order = await db.order.create({
    data: {
      number,
      userId,
      bundleId,
      amount: 0,
      currency: 'SGD',
      status: 'PENDING',
      paypalOrderId: syntheticPaypalId
    }
  });

  // Run the standard fulfillment path so entitlements + voucher PDFs
  // + purchase email all behave identically to a paid order.
  await fulfillOrder(order.id, { freeClaim: true }, syntheticPaypalId);

  return NextResponse.json({ ok: true, orderId: order.id });
}
