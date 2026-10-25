import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ClipboardList, Play } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getAttemptHistory, type ExamHistory } from '@/lib/attempt-history';
import { AttemptRow } from '@/components/attempt-row';
import { ScoreTrend } from '@/components/score-trend';
import { startFromDashboard } from '../actions';

// Attempt history: every attempt with its score, filterable by exam. With an
// exam selected it also shows the score trend and domain performance across
// all of that exam's attempts. Each row opens the full answer review.
export default async function AttemptsPage({ searchParams }: { searchParams: Promise<{ exam?: string }> }) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect('/login');

  const { attempts, exams } = await getAttemptHistory(userId);
  const examParam = (await searchParams).exam;
  const selected = exams.find((e) => e.examId === examParam) ?? null;
  const list = selected ? selected.attempts : attempts;

  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Exam history</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Your score on every attempt. Open one to see how you did in each exam domain and review every question against the answer key.
        </p>
      </div>

      {exams.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <Chip href="/user-dashboard/attempts" active={!selected}>All exams · {attempts.length}</Chip>
          {exams.map((e) => (
            <Chip key={e.examId} href={`/user-dashboard/attempts?exam=${e.examId}`} active={selected?.examId === e.examId}>
              {e.code} · {e.attempts.length}
            </Chip>
          ))}
        </div>
      )}

      {selected ? (
        <ExamSummary exam={selected} />
      ) : (
        exams.length > 1 && (
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((e) => <ExamMini key={e.examId} exam={e} />)}
          </div>
        )
      )}

      <section className="card overflow-hidden">
        <h2 className="border-b border-line px-4 py-3 text-sm font-semibold dark:border-slate-800">
          {selected ? `${selected.code} attempts` : 'All attempts'}
        </h2>
        {list.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">No attempts yet — start a practice exam from your dashboard.</p>
            <Link href="/user-dashboard" className="btn-primary-grad mt-4 inline-flex">Go to my practice exams</Link>
          </div>
        ) : (
          <div className="divide-y divide-line dark:divide-slate-800">
            {list.map((a) => <AttemptRow key={a.id} a={a} showExam={!selected} />)}
          </div>
        )}
      </section>
    </>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={`inline-flex min-h-9 items-center rounded-full border px-3.5 font-mono text-sm ${
        active
          ? 'border-ink bg-ink text-white dark:border-white dark:bg-white dark:text-slate-950'
          : 'border-line bg-white hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      {children}
    </Link>
  );
}

function trendPoints(exam: ExamHistory) {
  return exam.attempts
    .filter((a) => a.score !== null)
    .map((a) => ({ id: a.id, score: a.score!, date: a.startedAt }))
    .reverse();
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="eyebrow text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-display text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

const pct = (n: number | null) => (n === null ? '—' : `${n}%`);

// Compact per-exam card on the "All exams" view.
function ExamMini({ exam }: { exam: ExamHistory }) {
  const points = trendPoints(exam);
  return (
    <Link href={`/user-dashboard/attempts?exam=${exam.examId}`} className="card-hover block p-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="badge-brand font-mono">{exam.code}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{exam.attempts.length} {exam.attempts.length === 1 ? 'attempt' : 'attempts'}</span>
      </div>
      <div className="mt-3 flex gap-6">
        <Stat label="Best" value={pct(exam.best)} />
        <Stat label="Latest" value={pct(exam.latest)} />
      </div>
      {points.length > 1 && <div className="mt-2"><ScoreTrend points={points} passMark={exam.passingScore} height={90} linkPoints={false} /></div>}
    </Link>
  );
}

function ExamSummary({ exam }: { exam: ExamHistory }) {
  const points = trendPoints(exam);
  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="card p-5">
        <div className="eyebrow text-[11px] text-slate-500 dark:text-slate-400">{exam.vendorName}</div>
        <h2 className="mt-0.5 font-display text-lg font-semibold leading-snug">{exam.title}</h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat label="Best" value={pct(exam.best)} />
          <Stat label="Average" value={pct(exam.average)} />
          <Stat label="Latest" value={pct(exam.latest)} />
        </div>
        {points.length > 0 && (
          <div className="mt-4">
            <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">Score per attempt (oldest → newest)</div>
            <ScoreTrend points={points} passMark={exam.passingScore} />
          </div>
        )}
        <form action={startFromDashboard} className="mt-4">
          <input type="hidden" name="examId" value={exam.examId} />
          <button name="mode" value="PRACTICE" className="btn-primary-grad gap-1.5 text-sm">
            <Play className="h-4 w-4" /> Practice again
          </button>
        </form>
      </section>

      <section className="card p-5">
        <h2 className="text-base font-semibold">Performance by exam domain</h2>
        <p className="mb-4 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Across all your submitted {exam.code} attempts, weakest first. Domains below the {exam.passingScore}% pass mark are your study targets.
        </p>
        {exam.domains.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Finish an attempt to see your domain breakdown.</p>
        ) : (
          <div className="grid gap-3">
            {exam.domains.map((d) => {
              const p = Math.round((d.correct / d.total) * 100);
              const weak = p < exam.passingScore;
              return (
                <div key={d.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
                  <span className="text-sm font-medium [overflow-wrap:anywhere]">
                    {d.name}
                    {weak && <span className="ml-2 whitespace-nowrap font-mono text-[11px] text-red-700 dark:text-red-400">FOCUS HERE</span>}
                  </span>
                  <span className="text-right font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">
                    {p}% · {d.correct}/{d.total}
                  </span>
                  <div className="col-span-2 h-2 overflow-hidden rounded bg-line dark:bg-slate-800">
                    <div className={`h-full rounded ${weak ? 'bg-red-600' : 'bg-emerald-700'}`} style={{ width: `${p}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
