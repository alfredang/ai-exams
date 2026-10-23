import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { buildSgqrPayload, getMerchantConfig, isEnabled, renderQrDataUrl } from '@/lib/payments/paynow';
import { nextNumber } from '@/lib/numbering';
import { evaluateCoupon, recordCouponRedemption } from '@/lib/coupons';
import { getSetting } from '@/lib/settings';
import { STORE_CURRENCY } from '@/lib/currency';
import { productSale } from '@/lib/products';

export const runtime = 'nodejs';

const Body = z.object({
  bundleId: z.string().min(1),
  tier: z.enum(['PRACTICE', 'VOUCHER']).optional(),
  billingAddressId: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable()
});

export async function POST(req: Request) {
  if (!(await isEnabled())) return NextResponse.json({ error: 'paynow-disabled' }, { status: 400 });
  const session = await auth();
  const user = session?.user as any;
  if (!user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { bundleId, tier, billingAddressId, couponCode } = Body.parse(await req.json());

  if (billingAddressId) {
    const addr = await db.billingAddress.findUnique({ where: { id: billingAddressId } });
    if (!addr || addr.userId !== user.id) return NextResponse.json({ error: 'invalid-address' }, { status: 400 });
  }

  let amount: number;
  let orderTier: 'PRACTICE' | 'VOUCHER' | null = null;
  let vendorIdForCoupon: string | null = null;

  const bundle = await db.bundle.findUnique({
    where: { id: bundleId },
    include: { items: { take: 1, include: { exam: { select: { vendorId: true } } } } }
  });
  const sale = bundle ? productSale(bundle, tier) : null;
  if (!bundle || !sale) return NextResponse.json({ error: 'not-found' }, { status: 404 });
  amount = sale.amount;
  orderTier = sale.tier;
  vendorIdForCoupon = bundle.items[0]?.exam.vendorId ?? null;

  const merchant = await getMerchantConfig();
  if (!merchant.uen) return NextResponse.json({ error: 'paynow-uen-not-configured' }, { status: 500 });

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

  // Catalogue prices are in STORE_CURRENCY (USD) but SGQR can only carry SGD,
  // so convert at the admin-configured rate. Refuse rather than guess a rate.
  const fxBps = Number((await getSetting('FX_TO_SGD_USD_BPS')) || 0);
  if (!(fxBps > 0)) return NextResponse.json({ error: 'paynow-fx-not-configured' }, { status: 500 });
  const storeAmount = amount;
  amount = Math.round((amount * fxBps) / 10000);
  discount = Math.round((discount * fxBps) / 10000);

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
        currency: 'SGD',
        status: 'PENDING',
        provider: 'PAYNOW',
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

  const payload = buildSgqrPayload({
    uen: merchant.uen,
    amount,
    reference: order.id,
    merchantName: merchant.merchantName,
    merchantCity: merchant.merchantCity
  });
  const dataUrl = await renderQrDataUrl(payload);

  await db.order.update({
    where: { id: order.id },
    data: { providerOrderId: order.id, providerPayload: { sgqr: payload } }
  });

  return NextResponse.json({
    orderId: order.id,
    amount,
    currency: 'SGD',
    storeAmount,
    storeCurrency: STORE_CURRENCY,
    fxRateBps: fxBps,
    reference: order.id,
    sgqr: payload,
    qrDataUrl: dataUrl
  });
}
