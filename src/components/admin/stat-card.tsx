import Link from 'next/link';
import type { ReactNode } from 'react';

export type StatAccent = 'emerald' | 'brand' | 'amber' | 'rose' | 'slate';

// `!` because `.dark .card` sets the border colour at a higher specificity and
// would otherwise wipe the accent out in dark mode.
const ACCENT: Record<StatAccent, string> = {
  emerald: '!border-l-emerald-500',
  brand: '!border-l-brand-500',
  amber: '!border-l-amber-500',
  rose: '!border-l-rose-500',
  slate: '!border-l-slate-400'
};

/** One KPI tile: label, value, optional sub-line / action, optional link. */
export function StatCard({
  label,
  value,
  sub,
  accent,
  href,
  action,
  className = ''
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  accent?: StatAccent;
  href?: string;
  action?: ReactNode;
  className?: string;
}) {
  const body = (
    <>
      <div className="admin-label">{label}</div>
      <div className="font-display text-xl font-semibold tracking-tight text-ink dark:text-slate-100">{value}</div>
      {sub && <div className="text-[12px] text-muted">{sub}</div>}
    </>
  );
  const cls = `card flex gap-3 p-3.5 ${accent ? `border-l-[3px] ${ACCENT[accent]}` : ''} ${className}`;
  if (href && !action) {
    return (
      <Link href={href} className={`${cls} flex-col gap-0.5 hover:border-brand-300 hover:shadow-lift dark:hover:border-brand-400/50`}>
        {body}
      </Link>
    );
  }
  return (
    <div className={`${cls} items-center justify-between`}>
      <div className="flex min-w-0 flex-col gap-0.5">{body}</div>
      {action}
    </div>
  );
}
