import type { LucideIcon } from 'lucide-react';

export type Feature = { icon: LucideIcon; t: string; d: string };

// The four-card selling-point strip under the catalog headers
// (/practice-exams and /exam-vouchers share it so the pages match).
export function FeatureCards({ items, tone = 'brand' }: { items: Feature[]; tone?: 'brand' | 'emerald' }) {
  const iconBox =
    tone === 'emerald'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
      : 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300';
  return (
    <ul className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ icon: Icon, t, d }) => (
        <li key={t} className="card flex gap-3 p-4">
          <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBox}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="text-sm font-semibold">{t}</div>
            <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{d}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
