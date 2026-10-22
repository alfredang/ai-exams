'use client';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { BookOpen, History, Loader2, Play, RotateCcw, Timer } from 'lucide-react';
import { startFromDashboard } from '@/app/user-dashboard/actions';
import type { PracticeBadge } from '@/lib/my-exams';

// Dashboard grid of owned practice exams. Clicking a badge starts (or
// resumes) Practice mode and lands straight in the exam runner — no
// product page in between. Timed Exam mode is the small secondary button.
export function PracticeBadges({ badges }: { badges: PracticeBadge[] }) {
  if (badges.length === 0) {
    return (
      <div className="card p-8 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">You don't have any practice exams yet.</p>
        <Link href="/practice-exams" className="btn-primary-grad mt-4 inline-flex items-center gap-1">
          Browse practice exams →
        </Link>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {badges.map((b) => (
        <form key={b.examId} action={startFromDashboard} className="card-hover flex flex-col overflow-hidden">
          <input type="hidden" name="examId" value={b.examId} />
          <BadgeBody badge={b} />
        </form>
      ))}
    </div>
  );
}

const FOOT = 'flex items-center justify-center gap-1.5 py-2.5 hover:bg-slate-50 hover:text-brand-700 dark:hover:bg-slate-800/60 dark:hover:text-brand-300';

function BadgeBody({ badge: b }: { badge: PracticeBadge }) {
  const { pending, data } = useFormStatus();
  const pendingMode = pending ? (data?.get('mode') === 'EXAM' ? 'EXAM' : 'PRACTICE') : null;
  return (
    <>
      <button
        type="submit"
        name="mode"
        value="PRACTICE"
        disabled={pending}
        aria-label={`${b.inProgress ? 'Resume' : 'Start'} ${b.title} practice exam`}
        className="group flex flex-1 flex-col p-5 text-left disabled:cursor-wait"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-14 min-w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-indigo-600 px-2 font-mono text-sm font-bold tracking-tight text-white shadow-sm dark:from-brand-500 dark:to-indigo-500">
            {b.code}
          </span>
          <div className="min-w-0">
            <div className="eyebrow text-[11px] text-slate-500 dark:text-slate-400">{b.vendorName}</div>
            <h3 className="mt-0.5 line-clamp-2 font-display text-[15px] font-semibold leading-snug">{b.title}</h3>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-600 dark:text-slate-400">
          {b.attemptsTaken > 0 ? (
            <>
              <div className="flex justify-between">
                <span>Best <strong className="text-slate-900 dark:text-white">{Math.round(b.bestScore!)}%</strong></span>
                <span>Last {Math.round(b.lastScore!)}% · {b.attemptsTaken} {b.attemptsTaken === 1 ? 'attempt' : 'attempts'}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, b.bestScore!)}%` }} />
              </div>
            </>
          ) : (
            <span>{b.questionCount} questions · instant explanations · unlimited retakes</span>
          )}
        </div>

        <span className="btn-primary-grad mt-4 w-full gap-2 text-sm">
          {pendingMode === 'PRACTICE' ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Starting…</>
          ) : b.inProgress ? (
            <><RotateCcw className="h-4 w-4" /> Resume practice</>
          ) : (
            <><Play className="h-4 w-4" /> Start practice</>
          )}
        </span>
      </button>

      <div className="flex divide-x divide-line border-t border-line text-xs font-medium text-slate-600 dark:divide-slate-800 dark:border-slate-800 dark:text-slate-400">
        <button
          type="submit"
          name="mode"
          value="EXAM"
          disabled={pending}
          className={`${FOOT} flex-1 disabled:cursor-wait`}
        >
          {pendingMode === 'EXAM' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Timer className="h-3.5 w-3.5" />}
          Timed exam · {b.durationMinutes} min
        </button>
        {(b.attemptsTaken > 0 || b.inProgress) && (
          <Link href={`/user-dashboard/attempts?exam=${b.examId}`} className={`${FOOT} px-4`}>
            <History className="h-3.5 w-3.5" /> History
          </Link>
        )}
      </div>
    </>
  );
}
