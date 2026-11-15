import type { PrismaClient } from '@prisma/client';

/**
 * One-time cancellation of abandoned checkouts, run from the boot seed.
 * Every PENDING order older than an hour becomes CANCELLED (a checkout still
 * in progress is left alone). Nothing is charged or granted by a PENDING
 * order, so this only tidies the order lists; if a payment for one does
 * arrive later, fulfillOrder() still marks it PAID and grants access.
 *
 * `runId` makes it run exactly once: the AdminLog entry it writes is the
 * marker. To cancel again, call it from prisma/seed.ts with a new runId.
 */
export async function cancelPendingOrdersOnce(db: PrismaClient, runId: string): Promise<number | null> {
  const done = await db.adminLog.findFirst({ where: { action: 'order.cancel_pending', targetId: runId }, select: { id: true } });
  if (done) return null;
  const admin = await db.user.findFirst({
    where: { role: 'ADMIN', active: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true }
  });
  if (!admin) return null;

  const cutoff = new Date(Date.now() - 60 * 60 * 1000);
  const where = { status: 'PENDING' as const, createdAt: { lt: cutoff } };
  const pending = await db.order.findMany({ where, select: { id: true, number: true } });
  return db.$transaction(async (tx) => {
    const { count } = pending.length
      ? await tx.order.updateMany({ where: { id: { in: pending.map((o) => o.id) }, ...where }, data: { status: 'CANCELLED' } })
      : { count: 0 };
    await tx.adminLog.create({
      data: {
        adminId: admin.id,
        action: 'order.cancel_pending',
        targetType: 'Order',
        targetId: runId,
        metadata: { count, via: 'deploy', orders: pending.map((o) => o.number ?? o.id).slice(0, 1000) }
      }
    });
    return count;
  });
}
