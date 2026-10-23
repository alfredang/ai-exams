import Link from 'next/link';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export type ActiveFilter = { key: string; label: string; clearHref: string };

/**
 * A `<form method="get">` shell. Children render the inputs (which should
 * use `name=` so URL params survive the submit). `activeFilters` shows
 * chips with one-click clear and `resetHref` resets all.
 */
export function FilterBar({
  children,
  resetHref,
  activeFilters
}: {
  children: ReactNode;
  resetHref?: string;
  activeFilters?: ActiveFilter[];
}) {
  return (
    <form method="get" className="card mb-3 flex flex-col gap-2 p-3">
      <div className="flex flex-wrap items-end gap-2">
        {children}
        <div className="ml-auto flex items-center gap-2">
          <button type="submit" className="h-8 rounded-md bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700">
            Apply
          </button>
          {resetHref && (
            <Link href={resetHref} className="h-8 rounded-md px-3 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 inline-flex items-center">
              Reset
            </Link>
          )}
        </div>
      </div>
      {activeFilters && activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">Active</span>
          {activeFilters.map((f) => (
            <Link
              key={f.key}
              href={f.clearHref}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title={`Clear ${f.key}`}
            >
              <span className="font-medium">{f.key}:</span>
              <span className="max-w-[10rem] truncate">{f.label}</span>
              <X className="h-3 w-3 opacity-60" />
            </Link>
          ))}
        </div>
      )}
    </form>
  );
}

export function FilterField({
  label,
  children,
  className = ''
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-0.5 ${className}`}>
      {label && (
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</span>
      )}
      {children}
    </label>
  );
}
