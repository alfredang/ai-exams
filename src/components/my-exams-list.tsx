'use client';
import Link from 'next/link';
import { BookOpen, Ticket } from 'lucide-react';
import { tierLabel } from '@/lib/utils';
import type { MyExamsListItem } from '@/lib/my-exams';

export function MyExamsList({ items, cols = 2 }: { items: MyExamsListItem[]; cols?: 2 | 3 }) {
  if (items.length === 0) {
    return (
      <div className="card p-8 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          You don't own any exams yet.
        </p>
        <Link href="/practice-exams" className="btn-primary-grad mt-4 inline-flex items-center gap-1">
          Browse catalog →
        </Link>
      </div>
    );
  }

  const gridCols = cols === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2';
  return (
    <div className={`grid gap-3 ${gridCols}`}>
      {items.map(item => {
        if (item.kind === 'bundle') {
          // One practice exam per certification. Each attempt is a fresh,
          // domain-weighted draw from its pool, so there is nothing to expand.
          const b = item.data;
          const row = b.items[0];
          return (
            <div key={`b-${b.bundleId}`} className="card flex flex-col p-4">
              <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="badge-brand">{b.vendorName}</span>
                <span className="badge">{b.code}</span>
                <span className="badge">{b.level}</span>
                {b.hasVoucher && (
                  <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    Voucher
                  </span>
                )}
              </div>
              <h3 className="line-clamp-2 text-sm font-semibold">{b.bundleTitle}</h3>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Practice exam · {row.questionCount} questions · {row.durationMinutes} min · unlimited retakes
              </div>
              {b.hasVoucher && (
                <div className="mt-3 flex items-start gap-2 rounded-md bg-emerald-50 p-3 text-xs dark:bg-emerald-950/30">
                  <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-900 dark:text-emerald-100">
                    Your real {b.code} exam voucher is in{' '}
                    <Link href="/user-dashboard/vouchers" className="font-medium underline">
                      Vouchers
                    </Link>
                    .
                  </span>
                </div>
              )}
              <div className="mt-auto pt-3">
                <Link href={`/practice-exams/${b.vendorSlug}/${b.bundleSlug}`} className="btn-secondary w-full text-sm">
                  Open exam
                </Link>
              </div>
            </div>
          );
        }

        // Standalone — single-variant card with an Open button.
        const e = item.data;
        return (
          <div key={`e-${e.entitlementId}`} className="card flex flex-col p-4">
            <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="badge-brand">{e.vendorName}</span>
              <span className="badge">{e.examCode}</span>
              <span
                className={`badge ${
                  e.tier === 'VOUCHER'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                }`}
              >
                {tierLabel(e.tier)}
              </span>
            </div>
            <h3 className="line-clamp-2 text-sm font-semibold">{e.examTitle}</h3>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {e.questionCount} questions · {e.durationMinutes} min
            </div>
            <div className="mt-auto pt-3">
              <Link
                href={`/practice-exams/${e.vendorSlug}/${e.examSlug}`}
                className="btn-secondary w-full text-sm"
              >
                Open exam
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

