'use client';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { BookOpen, BookOpenCheck, History, Loader2, RotateCcw, Timer } from 'lucide-react';
import { startFromDashboard } from '@/app/user-dashboard/actions';
import type { PracticeBadge } from '@/lib/my-exams';

// Dashboard grid of owned practice exams. Each badge offers the two modes
// side by side — timed Exam mode (the default, like the real test) and
// Practice mode — and either click lands straight in the exam runner,
// resuming an unfinished attempt in that mode.
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
        <form key={b.examId} action={startFromDashboard} className="card flex flex-col overflow-hidden">
          <input type="hidden" name="examId" value={b.examId} />
          <BadgeBody badge={b} />
        </form>
      ))}
    </div>
  );
}

const FOOT = 'flex items-center justify-center gap-1.5 py-2.5 hover:bg-slate-50 hover:text-brand-700 dark:hover:bg-slate-800/60 dark:hover:text-brand-300';
const MODE_BTN = 'flex flex-col items-start rounded-lg border p-3 text-left transition disabled:cursor-wait';

function BadgeBody({ badge: b }: { badge: PracticeBadge }) {
  const { pending, data } = useFormStatus();
  const pendingMode = pending ? (data?.get('mode') === 'PRACTICE' ? 'PRACTICE' : 'EXAM') : null;
  return (
    <>
      <div className="flex flex-1 flex-col p-5">
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
            <span>{b.questionCount} questions · {b.durationMinutes} min · unlimited retakes</span>
          )}
        </div>

        <div className="eyebrow mt-4 text-[11px] text-slate-500 dark:text-slate-400">Choose a mode</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="submit"
            name="mode"
            value="EXAM"
            disabled={pending}
            aria-label={`${b.examInProgress ? 'Resume' : 'Start'} ${b.title} in timed Exam mode`}
            className={`${MODE_BTN} border-brand bg-brand text-white shadow-sm hover:bg-brand-700 dark:border-brand-500 dark:bg-brand-500 dark:hover:bg-brand-600`}
          >
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              {pendingMode === 'EXAM' ? <Loader2 className="h-4 w-4 animate-spin" /> : b.examInProgress ? <RotateCcw className="h-4 w-4" /> : <Timer className="h-4 w-4" />}
              {pendingMode === 'EXAM' ? 'Starting…' : b.examInProgress ? 'Resume exam' : 'Exam mode'}
            </span>
            <span className="mt-1 text-[11px] leading-snug text-white/85">{b.durationMinutes}-min timer · answers revealed after you submit</span>
          </button>
          <button
            type="submit"
            name="mode"
            value="PRACTICE"
            disabled={pending}
            aria-label={`${b.inProgress ? 'Resume' : 'Start'} ${b.title} in Practice mode`}
            className={`${MODE_BTN} border-line bg-white text-ink hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-brand-500 dark:hover:bg-slate-800`}
          >
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              {pendingMode === 'PRACTICE' ? <Loader2 className="h-4 w-4 animate-spin" /> : b.inProgress ? <RotateCcw className="h-4 w-4" /> : <BookOpenCheck className="h-4 w-4" />}
              {pendingMode === 'PRACTICE' ? 'Starting…' : b.inProgress ? 'Resume practice' : 'Practice mode'}
            </span>
            <span className="mt-1 text-[11px] leading-snug text-slate-500 dark:text-slate-400">Untimed · answer and explanation after each question</span>
          </button>
        </div>
      </div>

      {(b.attemptsTaken > 0 || b.inProgress || b.examInProgress) && (
        <div className="flex border-t border-line text-xs font-medium text-slate-600 dark:border-slate-800 dark:text-slate-400">
          <Link href={`/user-dashboard/attempts?exam=${b.examId}`} className={`${FOOT} flex-1`}>
            <History className="h-3.5 w-3.5" /> Attempt history
          </Link>
        </div>
      )}
    </>
  );
}
