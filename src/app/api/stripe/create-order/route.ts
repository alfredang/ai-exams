import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { nextNumber } from '@/lib/numbering';
import { evaluateCoupon, recordCouponRedemption } from '@/lib/coupons';
import { getSetting } from '@/lib/settings';
import Stripe from 'stripe';

export const runtime = 'nodejs';

const Body = z.object({
  bundleId: z.string().min(1),
  tier: z.enum(['PRACTICE', 'VOUCHER']).optional(),
  billingAddressId: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable()
});

export async function POST(req: Request) {
  const stripeEnabled = await getSetting('STRIPE_ENABLED');
  if (stripeEnabled !== 'true') return NextResponse.json({ error: 'stripe-disabled' }, { status: 400 });
  const secretKey = await getSetting('STRIPE_SECRET_KEY');
  if (!secretKey) return NextResponse.json({ error: 'stripe-misconfigured' }, { status: 500 });
  
  const stripe = new Stripe(secretKey, { apiVersion: '2025-02-24.acacia' as any });

  const session = await auth();
  const user = session?.user as any;
  if (!user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { bundleId, tier, billingAddressId, couponCode } = Body.parse(await req.json());

  if (billingAddressId) {
    const addr = await db.billingAddress.findUnique({ where: { id: billingAddressId } });
    if (!addr || addr.userId !== user.id) {
      return NextResponse.json({ error: 'invalid-address' }, { status: 400 });
    }
  }

  let amount: number;
  const currency = 'SGD';
  let orderTier: 'PRACTICE' | 'VOUCHER' | null = null;
  let vendorIdForCoupon: string | null = null;

  const bundle = await db.bundle.findUnique({
    where: { id: bundleId },
    include: { items: { take: 1, include: { exam: { select: { vendorId: true } } } } }
  });
  if (!bundle || !bundle.published) return NextResponse.json({ error: 'not-found' }, { status: 404 });
  if (tier === 'VOUCHER' && bundle.priceVoucher != null) {
    amount = bundle.priceVoucher;
    orderTier = 'VOUCHER';
  } else {
    amount = bundle.price;
    orderTier = 'PRACTICE';
  }
  const purpose = bundle.title;
  vendorIdForCoupon = bundle.items[0]?.exam.vendorId ?? null;

  // Server-side coupon evaluation
  let couponId: string | null = null;
  let discount = 0;
  if (couponCode) {
    const result = await evaluateCoupon({
      code: couponCode,
      userId: user.id,
      examId: null,
      bundleId,
      vendorId: vendorIdForCoupon,
      subtotalCents: amount
    });
    if (!result.ok) return NextResponse.json({ error: 'coupon_invalid', reason: result.reason, message: result.message }, { status: 400 });
    couponId = result.couponId;
    discount = result.discountCents;
    amount = Math.max(0, amount - discount);
  }

  const number = await nextNumber('ORDER', 'ORD');
  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        number,
        userId: user.id,
        examId: null,
        bundleId,
        tier: orderTier,
        amount,
        currency,
        status: 'PENDING',
        provider: 'STRIPE',
        billingAddressId: billingAddressId || null,
        couponId,
        discount
      }
    });
    if (couponId && discount > 0) {
      await recordCouponRedemption({ couponId, userId: user.id, orderId: created.id, amountCents: discount }, tx);
    }
    return created;
  });

  const appUrl = process.env.APP_URL || new URL(req.url).origin;
  
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: purpose },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${appUrl}/checkout/success?orderId=${order.id}`,
    cancel_url: `${appUrl}/checkout/bundle/${bundleId}`,
    client_reference_id: order.id,
    customer_email: user.email,
  });

  await db.order.update({
    where: { id: order.id },
    data: { providerOrderId: stripeSession.id, providerPayload: stripeSession as any }
  });

  return NextResponse.json({ orderId: order.id, url: stripeSession.url, paymentId: stripeSession.id });
}
