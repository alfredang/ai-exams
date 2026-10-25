import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getPracticeBadges } from '@/lib/my-exams';
import { getAttemptHistory } from '@/lib/attempt-history';
import { PracticeBadges } from '@/components/practice-badges';
import { AttemptRow } from '@/components/attempt-row';
import { BookOpen, ChartBar, Trophy } from 'lucide-react';

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
