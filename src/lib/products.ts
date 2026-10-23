import type { PrismaClient, Tier } from '@prisma/client';

/**
 * The storefront sells two products per certification, both stored on one
 * Bundle row:
 *
 *   Practice Exam  — Bundle.slug / title / description, always USD 20,
 *                    on sale while Bundle.published.
 *   Exam Voucher   — Bundle.voucherSlug / voucherTitle / voucherDescription,
 *                    priced at Bundle.priceVoucher, on sale while
 *                    voucherPublished and a price is set. It always includes
 *                    the Practice Exam: fulfilment grants every BundleItem
 *                    (PRACTICE + VOUCHER, same pool exam) for a VOUCHER order.
 *
 * Keeping both on one row is what links a voucher to its practice exam
 * automatically — there is nothing for an admin to wire up.
 */

/** Practice Exam price in USD cents. Enforced on every deploy by normalizeProducts(). */
export const PRACTICE_PRICE_CENTS = 2000;

export const VOUCHER_DELIVERY_TEXT = '3–5 business days';

type SlugFields = { slug: string; voucherSlug?: string | null };
type TitleFields = { title: string; voucherTitle?: string | null };
type VoucherSale = {
  published: boolean;
  price: number;
  priceVoucher: number | null;
  voucherPublished?: boolean | null;
};

export function voucherSlugFor(b: SlugFields): string {
  return b.voucherSlug || `${b.slug}-exam-voucher`;
}

export function voucherTitleFor(b: TitleFields): string {
  return b.voucherTitle || `${b.title} Exam Voucher`;
}

export function voucherDescriptionFor(
  b: { voucherDescription?: string | null },
  ctx: { vendorName?: string; code?: string | null }
): string {
  if (b.voucherDescription) return b.voucherDescription;
  const name = [ctx.vendorName, ctx.code].filter(Boolean).join(' ') || 'certification';
  return `An official ${name} exam voucher for one attempt at the real certification exam, emailed within ${VOUCHER_DELIVERY_TEXT}. Includes our full ${ctx.code || name} practice exam at no extra cost — unlocked the moment you pay, with timed Exam mode, Practice mode and unlimited retakes.`;
}

/** Strip a retired variant suffix: "AZ-104-P1" -> "AZ-104". */
export function displayExamCode(code: string | null | undefined): string {
  return (code || '').replace(/-(?:P|PRACTICE-)\d+$/i, '');
}

export function practiceOnSale(b: VoucherSale): boolean {
  return b.published;
}

export function voucherOnSale(b: VoucherSale): boolean {
  return b.priceVoucher != null && b.voucherPublished !== false;
}

export function practiceHref(vendorSlug: string, b: SlugFields): string {
  return `/practice-exams/${vendorSlug}/${b.slug}`;
}

export function voucherHref(vendorSlug: string, b: SlugFields): string {
  return `/exam-vouchers/${vendorSlug}/${voucherSlugFor(b)}`;
}

export function checkoutHref(bundleId: string, tier: 'PRACTICE' | 'VOUCHER'): string {
  return `/checkout/bundle/${bundleId}?tier=${tier}`;
}

/**
 * What a checkout for (bundle, requested tier) sells and for how much, or
 * null when that product isn't on sale. Every create-order route, the coupon
 * check and the checkout page go through this so they always agree.
 */
export function productSale(
  b: VoucherSale,
  requested: string | null | undefined
): { tier: 'PRACTICE' | 'VOUCHER'; amount: number } | null {
  if (requested === 'VOUCHER') {
    return voucherOnSale(b) ? { tier: 'VOUCHER', amount: b.priceVoucher! } : null;
  }
  return practiceOnSale(b) ? { tier: 'PRACTICE', amount: b.price } : null;
}

/** Customer-facing product name for an order/invoice line. */
export function productTitle(b: TitleFields, tier: Tier | null | undefined): string {
  if (tier === 'VOUCHER') return voucherTitleFor(b);
  return /practice exam$/i.test(b.title) ? b.title : `${b.title} Practice Exam`;
}

/**
 * Keep every product's PRACTICE and VOUCHER items pointing at the same pool
 * exam, so buying the voucher always grants that practice exam. Call after
 * changing a product's question bank or turning its voucher on.
 */
export async function syncProductItems(db: PrismaClient, bundleId: string, examId: string) {
  await db.$transaction([
    db.bundleItem.deleteMany({ where: { bundleId, NOT: { examId } } }),
    db.bundleItem.upsert({
      where: { bundleId_examId_tier: { bundleId, examId, tier: 'PRACTICE' } },
      create: { bundleId, examId, tier: 'PRACTICE', position: 0 },
      update: { position: 0 }
    }),
    db.bundleItem.upsert({
      where: { bundleId_examId_tier: { bundleId, examId, tier: 'VOUCHER' } },
      create: { bundleId, examId, tier: 'VOUCHER', position: 1 },
      update: { position: 1 }
    })
  ]);
}

/**
 * Deploy-time invariants (run from prisma/seed.ts): every paid Practice Exam
 * costs PRACTICE_PRICE_CENTS, every product has a voucher slug, and every
 * product that sells a voucher has its VOUCHER item on the practice exam.
 * Idempotent.
 */
export async function normalizeProducts(db: PrismaClient) {
  await db.bundle.updateMany({
    where: { price: { gt: 0, not: PRACTICE_PRICE_CENTS } },
    data: { price: PRACTICE_PRICE_CENTS }
  });
  const products = await db.bundle.findMany({
    select: { id: true, slug: true, voucherSlug: true, priceVoucher: true, items: { select: { examId: true, tier: true } } }
  });
  for (const p of products) {
    if (!p.voucherSlug) {
      await db.bundle.update({ where: { id: p.id }, data: { voucherSlug: voucherSlugFor(p) } }).catch(() => undefined);
    }
    const practice = p.items.find((i) => i.tier === 'PRACTICE');
    if (practice && p.priceVoucher != null && !p.items.some((i) => i.tier === 'VOUCHER' && i.examId === practice.examId)) {
      await db.bundleItem.create({ data: { bundleId: p.id, examId: practice.examId, tier: 'VOUCHER', position: 1 } });
    }
  }
}
