import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createPaymentRequest, isEnabled } from '@/lib/payments/hitpay';
import { nextNumber } from '@/lib/numbering';
import { evaluateCoupon, recordCouponRedemption } from '@/lib/coupons';

export const runtime = 'nodejs';

const Body = z.object({
  bundleId: z.string().min(1),
  tier: z.enum(['PRACTICE', 'VOUCHER']).optional(),
  billingAddressId: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable()
});

export async function POST(req: Request) {
  if (!(await isEnabled())) return NextResponse.json({ error: 'hitpay-disabled' }, { status: 400 });
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
        provider: 'HITPAY',
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
  const payment = await createPaymentRequest({
    amount,
    currency,
    email: user.email,
    name: user.name ?? undefined,
    purpose,
    referenceNumber: order.id,
    redirectUrl: `${appUrl}/api/hitpay/return?orderId=${order.id}`,
    webhookUrl: `${appUrl}/api/hitpay/webhook`
  });

  await db.order.update({
    where: { id: order.id },
    data: { providerOrderId: payment.id, providerPayload: payment.raw }
  });

  return NextResponse.json({ orderId: order.id, url: payment.url, paymentId: payment.id });
}
