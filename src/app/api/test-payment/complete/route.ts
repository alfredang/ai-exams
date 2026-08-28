/**
 * Test-mode payment completion endpoint. Bypasses PayPal entirely:
 * creates an Order, marks it PAID, calls fulfillOrder() to grant
 * entitlements and send the purchase email — same outcome as a real
 * PayPal capture.
 *
 * Gated by NEXT_PUBLIC_TEST_PAYMENTS=true. Returns 403 otherwise.
 * Also gated by sign-in. The fake paypalOrderId/captureId start with
 * "TEST_" so test orders are obvious in the DB.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { fulfillOrder } from '@/lib/fulfill';
import { nextNumber } from '@/lib/numbering';
import type { Tier } from '@prisma/client';

const Body = z.object({
  kind: z.literal('bundle'),
  bundleId: z.string().min(1),
  tier: z.enum(['PRACTICE', 'VOUCHER']).optional()
});

export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_TEST_PAYMENTS !== 'true') {
    return NextResponse.json({ error: 'Test payments disabled' }, { status: 403 });
  }

  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const body = Body.parse(await req.json());
  const testId = `TEST_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

  const bundle = await db.bundle.findUnique({ where: { id: body.bundleId } });
  if (!bundle || !bundle.published) {
    return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
  }
  const tier = body.tier === 'VOUCHER' && bundle.priceVoucher != null ? 'VOUCHER' : 'PRACTICE';
  const amount = tier === 'VOUCHER' ? bundle.priceVoucher! : bundle.price;
  const number = await nextNumber('ORDER', 'ORD');
  const order = await db.order.create({
    data: {
      number,
      userId,
      bundleId: body.bundleId,
      tier: tier as Tier,
      amount,
      currency: 'SGD',
      status: 'PENDING',
      paypalOrderId: testId
    }
  });

  await fulfillOrder(order.id, { test: true }, `${testId}_CAP`);
  return NextResponse.json({ ok: true, orderId: order.id, test: true });
}
