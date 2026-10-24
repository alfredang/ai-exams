import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { fmtDuration, type HistoryAttempt } from '@/lib/attempt-history';

// One attempt in a history list. The whole row opens the results review
// (score, domain breakdown, every answer against the key) — or resumes the
// runner when the attempt is still in progress.
export function AttemptRow({ a, showExam = true }: { a: HistoryAttempt; showExam?: boolean }) {
  const href = a.inProgress ? `/exam/${a.id}` : `/results/${a.id}`;
  const mode = a.isTeaser ? 'Free teaser' : a.mode === 'EXAM' ? 'Timed exam' : 'Practice';
  return (
    <Link
      href={href}
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3.5 transition hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_96px_132px_9rem] dark:hover:bg-slate-800/50"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
          {showExam && <span className="badge-brand font-mono">{a.examCode}</span>}
          <span>{mode}</span>
        </div>
        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {a.startedAt.toLocaleString('en-SG', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
          {a.timeUsedSec !== null && <> · {fmtDuration(a.timeUsedSec)} used</>}
        </div>
      </div>

      <div className="text-right sm:text-left">
        {a.inProgress ? (
          <span className="text-sm text-slate-500 dark:text-slate-400">—</span>
        ) : (
          <>
            <div className="font-display text-lg font-bold tabular-nums leading-none">{a.score}%</div>
            <div className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">{a.correct} / {a.total}</div>
          </>
        )}
      </div>

      <div className="col-span-2 sm:col-span-1">
        {a.inProgress ? (
          <span className="inline-flex w-28 justify-center rounded-full border border-amber-600 bg-amber-50 px-2.5 py-0.5 font-mono text-xs text-amber-800 dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-300">
            In progress
          </span>
        ) : a.passed ? (
          <span className="inline-flex w-28 justify-center rounded-full border border-emerald-700 bg-emerald-50 px-2.5 py-0.5 font-mono text-xs text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-300">
            ✓ Pass
          </span>
        ) : (
          <span className="inline-flex w-28 justify-center rounded-full border border-red-600 bg-red-50 px-2.5 py-0.5 font-mono text-xs text-red-700 dark:border-red-500 dark:bg-red-950/50 dark:text-red-300">
            ✗ Fail
          </span>
        )}
      </div>

      <span className="hidden items-center justify-end gap-1 text-sm font-medium text-brand-700 sm:inline-flex dark:text-brand-300">
        {a.inProgress ? 'Resume' : 'Review answers'} <ChevronRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
