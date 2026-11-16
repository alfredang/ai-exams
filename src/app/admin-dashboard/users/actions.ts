'use server';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

const LIST = '/admin-dashboard/users';

/** Back to the users list, keeping its filters, with the outcome in the query. */
function listHref(returnTo: string, outcome: Record<string, string>) {
  const safe = returnTo.startsWith(`${LIST}?`) ? returnTo : LIST;
  const url = new URL(safe, 'http://local');
  for (const key of ['deleted', 'deleteError']) url.searchParams.delete(key);
  for (const [key, value] of Object.entries(outcome)) url.searchParams.set(key, value);
  return `${url.pathname}${url.search}`;
}

/**
 * Permanently delete a customer account with its access grants, attempts,
 * reviews, notes and linked sign-ins. Refused for staff, for the admin's own
 * account, and for any account with orders, invoices or coupon redemptions —
 * those are GST records, so the account is anonymised instead.
 */
export async function deleteUser(formData: FormData) {
  const session = await auth();
  const sessionUser = session?.user as { id?: string; impersonatedBy?: string } | undefined;
  if (!sessionUser?.id) redirect('/login');
  const actor = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, role: true, active: true }
  });
  if (!actor?.active || actor.role !== 'ADMIN' || sessionUser.impersonatedBy) redirect('/');

  const id = String(formData.get('id') || '');
  const returnTo = String(formData.get('returnTo') || '');
  const fail = (reason: string): never => redirect(listHref(returnTo, { deleteError: reason }));

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      _count: { select: { orders: true, invoices: true, couponRedemptions: true } }
    }
  });
  if (!user) return fail('missing');
  if (user.id === actor.id) return fail('self');
  if (user.role !== 'USER') return fail('staff');
  if (user._count.orders || user._count.invoices || user._count.couponRedemptions) return fail('orders');

  try {
    await db.$transaction(async (tx) => {
      // Attempts are SetNull on the user FK; delete them so no ownerless
      // history is left behind. Everything else cascades with the account.
      const attempts = await tx.attempt.deleteMany({ where: { userId: user.id } });
      await tx.otpCode.deleteMany({ where: { email: user.email } });
      await tx.user.delete({ where: { id: user.id } });
      await tx.adminLog.create({
        data: {
          adminId: actor.id,
          action: 'user.delete',
          targetType: 'User',
          targetId: user.id,
          metadata: { email: user.email, name: user.name, attempts: attempts.count }
        }
      });
    });
  } catch (error) {
    // A record that must be kept (e.g. audit entries from a former staff
    // account) still points at this user.
    if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2003', 'P2014'].includes(error.code)) {
      return fail('linked');
    }
    throw error;
  }
  redirect(listHref(returnTo, { deleted: user.email }));
}
