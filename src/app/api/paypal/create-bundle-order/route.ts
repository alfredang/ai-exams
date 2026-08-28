import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createOrder } from '@/lib/paypal';
import { nextNumber } from '@/lib/numbering';
import { evaluateCoupon, recordCouponRedemption } from '@/lib/coupons';

const Body = z.object({
  bundleId: z.string(),
  tier: z.enum(['PRACTICE', 'VOUCHER']).optional(),
  billingAddressId: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable()
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const { bundleId, tier, billingAddressId, couponCode } = Body.parse(await req.json());
  if (billingAddressId) {
    const addr = await db.billingAddress.findUnique({ where: { id: billingAddressId } });
    if (!addr || addr.userId !== userId) {
      return NextResponse.json({ error: 'Invalid billing address' }, { status: 400 });
    }
  }
  const bundle = await db.bundle.findUnique({
    where: { id: bundleId },
    include: { items: { include: { exam: { select: { vendorId: true } } } } }
  });
  if (!bundle || !bundle.published) return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });

  let subtotal: number;
  let orderTier: 'PRACTICE' | 'VOUCHER' | null;
  if (tier === 'VOUCHER' && bundle.priceVoucher != null) {
    subtotal = bundle.priceVoucher;
    orderTier = 'VOUCHER';
  } else {
    subtotal = bundle.price;
    orderTier = tier === 'PRACTICE' ? 'PRACTICE' : null;
  }

  // For a bundle, single-vendor coupons apply only when all items share a vendor.
  const vendorIds = new Set(bundle.items.map((i) => i.exam.vendorId));
  const vendorIdForCoupon = vendorIds.size === 1 ? [...vendorIds][0] : null;

  let couponId: string | null = null;
  let discount = 0;
  if (couponCode) {
    const result = await evaluateCoupon({
      code: couponCode,
      userId,
      examId: null,
      bundleId,
      vendorId: vendorIdForCoupon,
      subtotalCents: subtotal
    });
    if (!result.ok) return NextResponse.json({ error: 'coupon_invalid', reason: result.reason, message: result.message }, { status: 400 });
    couponId = result.couponId;
    discount = result.discountCents;
  }
  const amount = Math.max(0, subtotal - discount);

  const paypal = await createOrder(amount, 'SGD', `bundle:${bundleId}${orderTier ? `:${orderTier}` : ''}`);
  const number = await nextNumber('ORDER', 'ORD');
  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        number,
        userId,
        bundleId,
        tier: orderTier,
        amount,
        currency: 'SGD',
        status: 'PENDING',
        provider: 'PAYPAL',
        paypalOrderId: paypal.id,
        providerOrderId: paypal.id,
        billingAddressId: billingAddressId || null,
        couponId,
        discount
      }
    });
    if (couponId && discount > 0) {
      await recordCouponRedemption({ couponId, userId, orderId: created.id, amountCents: discount }, tx);
    }
    return created;
  });
  return NextResponse.json({ orderId: order.id, paypalOrderId: paypal.id });
}
