import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LayoutGrid, List } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getGroupedExams, lastAttemptByExam, MY_EXAMS_SORTS, sortListItems, toListItems, type MyExamsSort } from '@/lib/my-exams';
import { MyExamsList } from '@/components/my-exams-list';

export default async function MyExamsPage({
  searchParams
}: {
  searchParams: Promise<{ view?: string; sort?: string }>;
}) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect('/login');

  const sp = await searchParams;
  const view = sp.view === 'list' ? 'list' : 'cards';
  const sort: MyExamsSort = MY_EXAMS_SORTS.some((s) => s.value === sp.sort) ? (sp.sort as MyExamsSort) : 'recent';

  const [grouped, lastAttempt] = await Promise.all([getGroupedExams(userId), lastAttemptByExam(userId)]);
  const items = sortListItems(toListItems(grouped), sort, lastAttempt);
  const total = grouped.bundles.length + grouped.standalone.length;
  const href = (p: { view?: string; sort?: string }) => {
    const q = new URLSearchParams();
    const v = p.view ?? view;
    const s = p.sort ?? sort;
    if (v !== 'cards') q.set('view', v);
    if (s !== 'recent') q.set('sort', s);
    const qs = q.toString();
    return qs ? `/user-dashboard/exams?${qs}` : '/user-dashboard/exams';
  };

  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">My Exams</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {total === 0
            ? "You don't own any exams yet."
            : `${total} ${total === 1 ? 'exam' : 'exams'} in your library.`}
        </p>
      </div>
      {total > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Sort exams" className="flex flex-wrap gap-2">
            {MY_EXAMS_SORTS.map((s) => (
              <Chip key={s.value} href={href({ sort: s.value })} active={sort === s.value}>
                {s.label}
              </Chip>
            ))}
          </nav>
          <div role="group" aria-label="Layout" className="inline-flex rounded-lg border border-line bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900">
            <ViewButton href={href({ view: 'cards' })} active={view === 'cards'} label="Cards">
              <LayoutGrid className="h-4 w-4" />
            </ViewButton>
            <ViewButton href={href({ view: 'list' })} active={view === 'list'} label="List">
              <List className="h-4 w-4" />
            </ViewButton>
          </div>
        </div>
      )}
      <MyExamsList items={items} view={view} />
    </>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'true' : undefined}
      className={`inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm ${
        active
          ? 'border-ink bg-ink text-white dark:border-white dark:bg-white dark:text-slate-950'
          : 'border-line bg-white hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      {children}
    </Link>
  );
}

function ViewButton({ href, active, label, children }: { href: string; active: boolean; label: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'true' : undefined}
      className={`inline-flex min-h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium ${
        active
          ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
      }`}
    >
      {children}
      {label}
    </Link>
  );
}
