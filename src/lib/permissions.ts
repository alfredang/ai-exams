import type { Role } from '@prisma/client';

/**
 * Permission codes used across the admin app. Naming convention:
 * `<domain>.<resource>.<action>` or `<domain>.<action>` for simple ones.
 */
export type Permission =
  | 'admin.full'
  | 'admin.access'        // can enter /admin-dashboard at all
  | 'exam.read'
  | 'exam.write'
  | 'exam.publish'
  | 'order.read'
  | 'order.refund'
  | 'order.delete'
  | 'invoice.read'
  | 'invoice.write'
  | 'coupon.read'
  | 'coupon.write'
  | 'voucher.read'
  | 'voucher.write'
  | 'user.read'
  | 'user.write'
  | 'user.export'
  | 'user.impersonate'
  | 'user.anonymize'
  | 'settings.read'
  | 'settings.write'
  | 'reports.read'
  | 'webhook.read'
  | 'audit.read'
  | 'api-token.read'
  | 'api-token.write';

const FULL: Permission[] = [
  'admin.full',
  'admin.access',
  'exam.read', 'exam.write', 'exam.publish',
  'order.read', 'order.refund', 'order.delete',
  'invoice.read', 'invoice.write',
  'coupon.read', 'coupon.write',
  'voucher.read', 'voucher.write',
  'user.read', 'user.write', 'user.export', 'user.impersonate', 'user.anonymize',
  'settings.read', 'settings.write',
  'reports.read', 'webhook.read', 'audit.read',
  'api-token.read', 'api-token.write'
];

const READ_ONLY: Permission[] = [
  'admin.access',
  'exam.read', 'order.read', 'invoice.read', 'coupon.read', 'voucher.read',
  'user.read', 'settings.read', 'reports.read', 'webhook.read', 'audit.read', 'api-token.read'
];

const FINANCE: Permission[] = [
  ...READ_ONLY,
  'invoice.write', 'order.refund', 'coupon.write'
];

const SUPPORT: Permission[] = [
  ...READ_ONLY,
  'user.write', 'voucher.write'
];

const CONTENT: Permission[] = [
  ...READ_ONLY,
  'exam.write', 'exam.publish'
];

const ROLE_PERMS: Record<Role, Permission[]> = {
  USER: [],
  ADMIN: FULL,
  FINANCE,
  SUPPORT,
  CONTENT,
  READ_ONLY
};

export function permissionsFor(role: Role): Permission[] {
  return ROLE_PERMS[role] ?? [];
}

export function can(role: Role | undefined | null, perm: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMS[role]?.includes(perm) ?? false;
}

/** True for any role that may enter the admin dashboard. */
export function isAdminRole(role: Role | undefined | null): boolean {
  return !!role && role !== 'USER';
}
