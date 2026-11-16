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
 * reviews, notes and linked sign-ins. Refused for staff and for the admin's
 * own account. An account with orders, invoices or coupon redemptions (GST
 * records) is refused unless the admin ticked the override in the dialog
 * (`force`): then those records are deleted too, and their numbers and
 * amounts are kept in the `user.delete` audit entry.
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
  const force = formData.get('force') === '1';
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
  const hasRecords = Boolean(user._count.orders || user._count.invoices || user._count.couponRedemptions);
  if (hasRecords && !force) return fail('orders');

  try {
    await db.$transaction(async (tx) => {
      // Attempts are SetNull on the user FK; delete them so no ownerless
      // history is left behind. Everything else cascades with the account.
      const attempts = await tx.attempt.deleteMany({ where: { userId: user.id } });
      // Override: remove the money trail first (the FKs refuse otherwise),
      // keeping a snapshot of what was deleted in the audit entry.
      let records: Prisma.InputJsonObject | undefined;
      if (hasRecords) {
        const orders = await tx.order.findMany({
          where: { userId: user.id },
          select: { id: true, number: true, status: true, amount: true, currency: true, provider: true, tier: true, createdAt: true }
        });
        const orderIds = orders.map((o) => o.id);
        const invoices = await tx.invoice.findMany({
          where: { OR: [{ userId: user.id }, { orderId: { in: orderIds } }] },
          select: { id: true, number: true, status: true, total: true, currency: true, issueDate: true, creditNoteOfId: true }
        });
        const invoiceIds = invoices.map((i) => i.id);
        await tx.refund.deleteMany({
          where: { OR: [{ orderId: { in: orderIds } }, { creditNoteInvoiceId: { in: invoiceIds } }] }
        });
        await tx.couponRedemption.deleteMany({ where: { OR: [{ userId: user.id }, { orderId: { in: orderIds } }] } });
        await tx.voucherDelivery.deleteMany({ where: { orderId: { in: orderIds } } });
        // Credit notes point at the invoice they adjust — delete them first.
        await tx.invoice.deleteMany({ where: { id: { in: invoiceIds }, creditNoteOfId: { not: null } } });
        await tx.invoice.deleteMany({ where: { id: { in: invoiceIds } } });
        await tx.order.deleteMany({ where: { id: { in: orderIds } } });
        records = {
          orders: orders.map((o) => ({
            number: o.number, status: o.status, amount: o.amount, currency: o.currency,
            provider: o.provider, tier: o.tier, createdAt: o.createdAt.toISOString()
          })),
          invoices: invoices.map((i) => ({
            number: i.number, status: i.status, total: i.total, currency: i.currency,
            issueDate: i.issueDate.toISOString(), creditNote: Boolean(i.creditNoteOfId)
          }))
        };
      }
      await tx.otpCode.deleteMany({ where: { email: user.email } });
      // SetNull relations that still hold the person's address or consents.
      await tx.emailLog.deleteMany({ where: { OR: [{ userId: user.id }, { to: user.email }] } });
      await tx.consentLog.deleteMany({ where: { userId: user.id } });
      await tx.user.delete({ where: { id: user.id } });
      await tx.adminLog.create({
        data: {
          adminId: actor.id,
          action: 'user.delete',
          targetType: 'User',
          targetId: user.id,
          metadata: {
            email: user.email,
            name: user.name,
            attempts: attempts.count,
            ...(records ? { override: true, deleted: records } : {})
          }
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
