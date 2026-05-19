import { Prisma, type PaymentProvider, type Tier } from '@prisma/client';
import { db } from '@/lib/db';
import { evaluateCoupon, recordCouponRedemption } from '@/lib/coupons';
import { nextNumber } from '@/lib/numbering';

export type BundleCheckoutTier = 'PRACTICE' | 'VOUCHER';

export type BundleCheckoutDraft = {
  userId: string;
  bundleId: string;
  title: string;
  orderTier: BundleCheckoutTier;
  subtotal: number;
  amount: number;
  currency: string;
  billingAddressId: string | null;
  couponCode: string | null;
  vendorIdForCoupon: string | null;
  couponId: string | null;
  discount: number;
};

export class BundleCheckoutError extends Error {
  constructor(
    public code: string,
    public status: number,
    message = code
  ) {
    super(message);
  }
}

export async function prepareBundleCheckout(input: {
  userId: string;
  bundleId: string;
  tier?: BundleCheckoutTier;
  billingAddressId?: string | null;
  couponCode?: string | null;
  currency: string;
}): Promise<BundleCheckoutDraft> {
  if (input.billingAddressId) {
    const address = await db.billingAddress.findUnique({ where: { id: input.billingAddressId } });
    if (!address || address.userId !== input.userId) {
      throw new BundleCheckoutError('invalid-address', 400, 'Invalid billing address');
    }
  }

  const bundle = await db.bundle.findUnique({
    where: { id: input.bundleId },
    include: { items: { include: { exam: { select: { vendorId: true } } } } }
  });
  if (!bundle || !bundle.published) {
    throw new BundleCheckoutError('not-found', 404, 'Bundle not found');
  }

  const orderTier: BundleCheckoutTier =
    input.tier === 'VOUCHER' && bundle.priceVoucher != null ? 'VOUCHER' : 'PRACTICE';
  const subtotal = orderTier === 'VOUCHER' ? bundle.priceVoucher! : bundle.price;

  const vendorIds = new Set(bundle.items.map((item) => item.exam.vendorId));
  const vendorIdForCoupon = vendorIds.size === 1 ? [...vendorIds][0] : null;

  let couponId: string | null = null;
  let discount = 0;
  if (input.couponCode?.trim()) {
    const result = await evaluateCoupon({
      code: input.couponCode,
      userId: input.userId,
      examId: null,
      bundleId: input.bundleId,
      vendorId: vendorIdForCoupon,
      subtotalCents: subtotal
    });
    if (!result.ok) {
      throw new BundleCheckoutError(`coupon:${result.reason}`, 400, result.message);
    }
    couponId = result.couponId;
    discount = result.discountCents;
  }

  return {
    userId: input.userId,
    bundleId: input.bundleId,
    title: bundle.title,
    orderTier,
    subtotal,
    amount: Math.max(0, subtotal - discount),
    currency: input.currency,
    billingAddressId: input.billingAddressId || null,
    couponCode: input.couponCode?.trim() || null,
    vendorIdForCoupon,
    couponId,
    discount
  };
}

export async function createPendingBundleOrder(
  draft: BundleCheckoutDraft,
  input: {
    provider: PaymentProvider;
    providerOrderId?: string | null;
    providerPayload?: Prisma.InputJsonValue;
    legacyPaypalOrderId?: string | null;
  }
) {
  const number = await nextNumber('ORDER', 'ORD');
  return db.$transaction(async (tx) => {
    let couponId = draft.couponId;
    let discount = draft.discount;
    let amount = draft.amount;
    if (draft.couponCode) {
      const result = await evaluateCoupon(
        {
          code: draft.couponCode,
          userId: draft.userId,
          examId: null,
          bundleId: draft.bundleId,
          vendorId: draft.vendorIdForCoupon,
          subtotalCents: draft.subtotal
        },
        tx
      );
      if (!result.ok) {
        throw new BundleCheckoutError(`coupon:${result.reason}`, 400, result.message);
      }
      couponId = result.couponId;
      discount = result.discountCents;
      amount = Math.max(0, draft.subtotal - discount);
    }

    const order = await tx.order.create({
      data: {
        number,
        userId: draft.userId,
        bundleId: draft.bundleId,
        tier: draft.orderTier as Tier,
        amount,
        currency: draft.currency,
        status: 'PENDING',
        provider: input.provider,
        providerOrderId: input.providerOrderId ?? null,
        providerPayload: input.providerPayload,
        paypalOrderId: input.legacyPaypalOrderId ?? null,
        billingAddressId: draft.billingAddressId,
        couponId,
        discount
      }
    });

    if (couponId && discount > 0) {
      await recordCouponRedemption(
        { couponId, userId: draft.userId, orderId: order.id, amountCents: discount },
        tx
      );
    }

    return order;
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable
  });
}
