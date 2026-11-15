import type { PrismaClient } from '@prisma/client';
import { CLEANUP_UNREGISTERED_WHERE } from './admin-user-filters';

/**
 * One-time user clean-up, run from the boot seed (there is no admin UI for
 * it). Deletes customer accounts that never took an exam, plus suspended and
 * anonymised accounts; accounts with orders, invoices or coupon redemptions,
 * staff, and learners registered for a class are kept (see CLEANUP_WHERE).
 *
 * `runId` makes it run exactly once: the audit entry it writes is the marker,
 * so later deploys skip it and new sign-ups are never touched. To run another
 * clean-up, call it from prisma/seed.ts with a new runId.
 */
export async function cleanUpUsersOnce(db: PrismaClient, runId: string): Promise<number | null> {
  const done = await db.adminLog.findFirst({ where: { action: 'user.cleanup', targetId: runId }, select: { id: true } });
  if (done) return null;
  const admin = await db.user.findFirst({
    where: { role: 'ADMIN', active: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true }
  });
  if (!admin) return null;

  const doomed = await db.user.findMany({ where: CLEANUP_UNREGISTERED_WHERE, select: { id: true, email: true } });
  return db.$transaction(async (tx) => {
    const { count } = doomed.length
      ? await tx.user.deleteMany({ where: { id: { in: doomed.map((u) => u.id) }, ...CLEANUP_UNREGISTERED_WHERE } })
      : { count: 0 };
    await tx.adminLog.create({
      data: {
        adminId: admin.id,
        action: 'user.cleanup',
        targetType: 'User',
        targetId: runId,
        metadata: { count, via: 'deploy', emails: doomed.map((u) => u.email).slice(0, 1000) }
      }
    });
    return count;
  });
}
