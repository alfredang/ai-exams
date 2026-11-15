import type { Prisma } from '@prisma/client';

export type UserFilterParams = {
  q?: string | null;
  status?: string | null;
  from?: string | null;
  to?: string | null;
};

function validDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
}

export function validUserDate(value: string): boolean {
  return validDate(value) !== null;
}

export function buildUserWhere(params: UserFilterParams): Prisma.UserWhereInput {
  const q = params.q?.trim() || '';
  const status = params.status || '';
  const from = validDate(params.from?.trim() || '');
  const to = validDate(params.to?.trim() || '');
  const where: Prisma.UserWhereInput = { role: 'USER' };

  if (q) where.OR = [
    { email: { contains: q, mode: 'insensitive' } },
    { name: { contains: q, mode: 'insensitive' } },
    { entitlements: { some: { courseRunId: q } } }
  ];
  if (status === 'active') Object.assign(where, { active: true, anonymizedAt: null });
  if (status === 'suspended') Object.assign(where, { active: false, anonymizedAt: null });
  if (status === 'anonymized') where.anonymizedAt = { not: null };
  if (from || to) {
    const end = to ? new Date(to.getTime() + 86_400_000) : null;
    where.createdAt = { ...(from ? { gte: from } : {}), ...(end ? { lt: end } : {}) };
  }
  return where;
}

/**
 * The "Clean up users" panel on /admin-dashboard/users: customer accounts
 * that have never taken an exam (verified or not), plus suspended and
 * anonymised accounts. Accounts with any money trail (orders, invoices,
 * coupon redemptions) are always kept: those records must stay for GST and
 * revenue history, and the database refuses to delete a user that still owns
 * them. Staff are kept too. Access grants are deleted with the account; a
 * suspended or anonymised account's attempts stay as ownerless rows.
 */
export const CLEANUP_WHERE: Prisma.UserWhereInput = {
  role: 'USER',
  orders: { none: {} },
  invoices: { none: {} },
  couponRedemptions: { none: {} },
  OR: [{ attempts: { none: {} } }, { active: false }, { anonymizedAt: { not: null } }]
};

/** Learners the TMS registered for a class (POST /api/v1/registrations). */
export const CLASS_REGISTERED_WHERE: Prisma.UserWhereInput = {
  entitlements: { some: { courseRunId: { not: null } } }
};

/** The same clean-up, keeping learners registered for a class. */
export const CLEANUP_UNREGISTERED_WHERE: Prisma.UserWhereInput = {
  ...CLEANUP_WHERE,
  entitlements: { none: { courseRunId: { not: null } } }
};
