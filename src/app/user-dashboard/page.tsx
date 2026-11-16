import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getPracticeBadges } from '@/lib/my-exams';
import { fmtDuration, getAttemptHistory, type HistoryAttempt } from '@/lib/attempt-history';
import { PracticeBadges } from '@/components/practice-badges';
import { AttemptRow } from '@/components/attempt-row';
import { BookOpen, ChartBar, CheckCircle2, Download, ListChecks, RotateCcw, Trophy, XCircle } from 'lucide-react';
import { startFromDashboard } from './actions';

// The signed-in landing page: the three most recently used practice exams as
// click-to-start badges (View all → My Exams), their latest attempts, then
// overall stats.
export default async function MyContentPage({
  searchParams
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect('/login');

  const history = await getAttemptHistory(userId);
  const badges = await getPracticeBadges(userId, history);
  const startFailed = (await searchParams).start === 'failed';

  const scores = history.attempts.filter((a) => a.score !== null).map((a) => a.score!);
  const avgScore = scores.length === 0 ? null : Math.round(scores.reduce((s, x) => s + x, 0) / scores.length);
  const recent = history.attempts.slice(0, 5);
  // The newest scored attempt leads the page: a candidate who has just
  // finished an exam sees the result, the answer review and Retake here.
  const latest = history.attempts.find((a) => a.score !== null && !a.isTeaser) ?? null;
  const latestPassMark = latest ? history.exams.find((e) => e.examId === latest.examId)?.passingScore ?? null : null;
  const latestBadges = badges.slice(0, 3);
  const userName = session!.user!.name || session!.user!.email?.split('@')[0] || 'there';

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {userName}</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          {badges.length > 0
            ? 'Pick an exam to start practising — you go straight into the questions.'
            : 'Your practice exams will appear here.'}
        </p>
      </div>

      {startFailed && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          That exam couldn't be started. Please try again, or contact us if it keeps happening.
        </div>
      )}

      {latest && <LatestResult a={latest} passMark={latestPassMark} />}

      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Latest Exams</h2>
          {badges.length > 0 && (
            <Link href="/user-dashboard/exams" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">
              View all ({badges.length}) →
            </Link>
          )}
        </div>
        <PracticeBadges badges={latestBadges} />
      </section>

      {recent.length > 0 && (
        <section className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent attempts</h2>
            <Link href="/user-dashboard/attempts" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">
              Full history →
            </Link>
          </div>
          <div className="card divide-y divide-line overflow-hidden dark:divide-slate-800">
            {recent.map((a) => <AttemptRow key={a.id} a={a} />)}
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={BookOpen} label="Practice exams" value={badges.length.toString()} accent="blue" />
        <StatCard icon={ChartBar} label="Attempts taken" value={scores.length.toString()} accent="purple" />
        <StatCard
          icon={Trophy}
          label="Average score"
          value={avgScore !== null ? `${avgScore}%` : '—'}
          accent="emerald"
        />
      </div>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent
}: {
  icon: any;
  label: string;
  value: string;
  accent: 'blue' | 'purple' | 'emerald';
}) {
  const accents: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
  };
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${accents[accent]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
      </div>
    </div>
  );
}

// Score card for the newest submitted attempt, with the three things a
// candidate wants after an exam: the answer review, its PDF and a retake.
function LatestResult({ a, passMark }: { a: HistoryAttempt; passMark: number | null }) {
  const when = a.startedAt.toLocaleString('en-SG', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  return (
    <section className="mb-10" aria-labelledby="latest-result">
      <h2 id="latest-result" className="mb-3 text-lg font-semibold">Your latest result</h2>
      <div className="card grid items-center gap-x-8 gap-y-4 p-5 sm:p-6 md:grid-cols-[auto_minmax(0,1fr)]">
        <div className="font-display text-[clamp(52px,10vw,76px)] font-extrabold leading-none tabular-nums">
          {a.correct}<small className="text-[0.38em] font-bold text-muted"> / {a.total}</small>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-display text-xl font-extrabold tracking-wide text-white ${a.passed ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-red-600 dark:bg-red-500'}`}>
              {a.passed ? <CheckCircle2 className="h-5 w-5" aria-hidden /> : <XCircle className="h-5 w-5" aria-hidden />}
              {a.passed ? 'PASS' : 'FAIL'}
            </span>
            <span className="text-lg font-semibold">
              {a.score}%{passMark !== null && <span className="font-normal text-muted"> · pass mark {passMark}%</span>}
            </span>
          </div>
          <h3 className="mt-2 font-display text-base font-semibold leading-snug [overflow-wrap:anywhere]">{a.examTitle}</h3>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
            {a.mode === 'EXAM' ? 'Exam mode' : 'Practice mode'} · {when}
            {a.timeUsedSec !== null && <> · {fmtDuration(a.timeUsedSec)} used</>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:col-span-2">
          <Link href={`/results/${a.id}`} className="btn-primary gap-1.5">
            <ListChecks className="h-4 w-4" aria-hidden /> Review questions and answers
          </Link>
          <a href={`/api/results/${a.id}/pdf`} download className="btn-outline inline-flex items-center gap-1.5">
            <Download className="h-4 w-4" aria-hidden /> Download review (PDF)
          </a>
          <form action={startFromDashboard}>
            <input type="hidden" name="examId" value={a.examId} />
            <button name="mode" value={a.mode} className="btn-outline inline-flex items-center gap-1.5">
              <RotateCcw className="h-4 w-4" aria-hidden /> Retake exam
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
