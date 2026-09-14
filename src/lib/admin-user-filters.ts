import type { Prisma } from '@prisma/client';

export type UserFilterParams = {
  q?: string | null;
  status?: string | null;
  tag?: string | null;
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
  const tag = params.tag?.trim() || '';
  const from = validDate(params.from?.trim() || '');
  const to = validDate(params.to?.trim() || '');
  const where: Prisma.UserWhereInput = { role: 'USER' };

  if (q) where.OR = [
    { email: { contains: q, mode: 'insensitive' } },
    { name: { contains: q, mode: 'insensitive' } }
  ];
  if (status === 'active') Object.assign(where, { active: true, anonymizedAt: null });
  if (status === 'suspended') Object.assign(where, { active: false, anonymizedAt: null });
  if (status === 'anonymized') where.anonymizedAt = { not: null };
  if (status === 'unverified') Object.assign(where, { emailVerified: null, anonymizedAt: null });
  if (tag) where.tags = { some: { tag: { slug: tag } } };
  if (from || to) {
    const end = to ? new Date(to.getTime() + 86_400_000) : null;
    where.createdAt = { ...(from ? { gte: from } : {}), ...(end ? { lt: end } : {}) };
  }
  return where;
}
