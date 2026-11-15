import type { PrismaClient } from '@prisma/client';
import { voucherPriceWithGst } from './currency';

/**
 * One-time Exam Voucher price rise (+10% for GST, rounded down to a whole
 * dollar — see voucherPriceWithGst), run from the boot seed. The seed already
 * writes the raised price for every voucher it manages from BUNDLE_SPECS; this
 * raises the rest once: prices an admin edited, and products an admin created.
 * `specPricedIds` are the bundles the seed priced this deploy (skipped here so
 * they are never raised twice). The Practice Exam price is never touched.
 *
 * `runId` makes it run exactly once (the AdminLog entry is the marker).
 */
export async function upliftVoucherPricesOnce(
  db: PrismaClient,
  runId: string,
  specPricedIds: Set<string>
): Promise<number | null> {
  const done = await db.adminLog.findFirst({ where: { action: 'voucher.price_gst_uplift', targetId: runId }, select: { id: true } });
  if (done) return null;
  const admin = await db.user.findFirst({
    where: { role: 'ADMIN', active: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true }
  });
  if (!admin) return null;

  const rows = await db.bundle.findMany({
    where: { priceVoucher: { not: null }, id: { notIn: [...specPricedIds] } },
    select: { id: true, slug: true, priceVoucher: true }
  });
  const changes = rows
    .map((r) => ({ id: r.id, slug: r.slug, from: r.priceVoucher!, to: voucherPriceWithGst(r.priceVoucher!) }))
    .filter((c) => c.to !== c.from);
  return db.$transaction(async (tx) => {
    for (const c of changes) {
      await tx.bundle.update({ where: { id: c.id }, data: { priceVoucher: c.to } });
    }
    await tx.adminLog.create({
      data: {
        adminId: admin.id,
        action: 'voucher.price_gst_uplift',
        targetType: 'Bundle',
        targetId: runId,
        metadata: { count: changes.length, via: 'deploy', changes: changes.map((c) => ({ slug: c.slug, from: c.from, to: c.to })) }
      }
    });
    return changes.length;
  });
}
