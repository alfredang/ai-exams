import type { ReactNode } from 'react';

export type BadgeVariant = 'success' | 'warn' | 'danger' | 'muted' | 'info';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  warn: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  muted: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
};

export function Badge({
  variant = 'muted',
  children,
  className = ''
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  PAID: 'success',
  PUBLISHED: 'success',
  SUCCEEDED: 'success',
  SENT: 'success',
  ACTIVE: 'success',
  INACTIVE: 'muted',
  PENDING: 'muted',
  DRAFT: 'muted',
  SCHEDULED: 'info',
  PROCESSING: 'info',
  ISSUED: 'info',
  FAILED: 'danger',
  CANCELED: 'danger',
  VOID: 'danger',
  ARCHIVED: 'muted',
  REFUNDED: 'warn',
  CREDIT_NOTE: 'warn',
  EXPIRED: 'warn'
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const variant = STATUS_VARIANTS[status] ?? 'muted';
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}
