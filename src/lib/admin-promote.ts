import type { PrismaClient } from '@prisma/client';

/**
 * One-time grant of the ADMIN role to an existing account, run from the boot
 * seed (the owner asked for it; Admin → Admins is the day-to-day way).
 *
 * `runId` makes it run exactly once: the AdminLog entry it writes is the
 * marker, so removing the role later in Admin → Admins sticks. If the account
 * doesn't exist yet, nothing is written and the next deploy tries again.
 */
export async function promoteAdminOnce(db: PrismaClient, email: string, runId: string): Promise<boolean | null> {
  const done = await db.adminLog.findFirst({ where: { action: 'user.promote', targetType: 'Deploy', targetId: runId }, select: { id: true } });
  if (done) return null;
  const admin = await db.user.findFirst({
    where: { role: 'ADMIN', active: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true }
  });
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, role: true, active: true, anonymizedAt: true }
  });
  if (!admin || !user || !user.active || user.anonymizedAt) return null;
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } }),
    db.adminLog.create({
      data: {
        adminId: admin.id,
        action: 'user.promote',
        targetType: 'Deploy',
        targetId: runId,
        metadata: { via: 'deploy', userId: user.id, email, previousRole: user.role }
      }
    })
  ]);
  return true;
}
