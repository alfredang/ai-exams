import type { LucideIcon } from 'lucide-react';

export type Feature = { icon: LucideIcon; t: string; d: string };

// The four-card selling-point strip under the catalog headers
// (/practice-exams and /exam-vouchers share it so the pages match).
export function FeatureCards({ items }: { items: Feature[] }) {
  return (
    <ul className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ icon: Icon, t, d }) => (
        <li key={t} className="card flex gap-3 p-4">
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden="true" />
          <div>
            <div className="text-sm font-semibold">{t}</div>
            <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{d}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
