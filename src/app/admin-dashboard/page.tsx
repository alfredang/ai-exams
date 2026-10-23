import Link from 'next/link';
import { db } from '@/lib/db';
import { formatMoney, tierLabel } from '@/lib/utils';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/badge';
import { paidOrdersIn, signupsIn, activeLearnersIn, taxCollectedIn, Ranges } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const today = Ranges.today();
  const last7 = Ranges.lastNDays(7);
  const last30 = Ranges.lastNDays(30);
  const mtd = Ranges.mtd();

  const [
    todayStats,
    last7Stats,
    last30Stats,
    mtdStats,
    signups30,
    activeLearners30,
    taxMtd,
    latestUsers,
    latestOrders,
    popularOrders,
    questionDrafts
  ] = await Promise.all([
    paidOrdersIn(today),
    paidOrdersIn(last7),
    paidOrdersIn(last30),
    paidOrdersIn(mtd),
    signupsIn(last30),
    activeLearnersIn(last30),
    taxCollectedIn(mtd),
    db.user.findMany({
      where: { role: 'USER' },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, email: true, name: true, active: true, createdAt: true }
    }),
    db.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { user: { select: { email: true } }, exam: { select: { title: true, code: true } }, bundle: { select: { title: true } } }
    }),
    db.order.groupBy({
      by: ['examId'],
      where: { status: 'PAID', examId: { not: null } },
      _count: { examId: true },
      orderBy: { _count: { examId: 'desc' } },
      take: 5
    }),
    db.question.count({ where: { status: 'DRAFT' } })
  ]);

  const popularExamIds = popularOrders.map((p) => p.examId!).filter(Boolean);
  const popularExams = popularExamIds.length
    ? await db.exam.findMany({
        where: { id: { in: popularExamIds } },
        include: { vendor: true }
      })
    : [];
  const popularExamMap = new Map(popularExams.map((e) => [e.id, e]));

  const refundRate30 = last30Stats.ordersCount
    ? (last30Stats.refundCount / last30Stats.ordersCount)
    : 0;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Operational health at a glance. Click any card to drill into the report." />

      {/* Revenue KPI row */}
      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Revenue today" value={formatMoney(todayStats.grossCents, 'USD')} sub={`${todayStats.ordersCount} order${todayStats.ordersCount === 1 ? '' : 's'}`} accent="emerald" href="/admin-dashboard/reports/revenue?range=today" />
        <Kpi label="Revenue · 7d" value={formatMoney(last7Stats.grossCents, 'USD')} sub={`AOV ${formatMoney(last7Stats.aovCents, 'USD')}`} accent="emerald" href="/admin-dashboard/reports/revenue?range=7d" />
        <Kpi label="Revenue · 30d" value={formatMoney(last30Stats.grossCents, 'USD')} sub={`Net ${formatMoney(last30Stats.netCents, 'USD')}`} accent="emerald" href="/admin-dashboard/reports/revenue?range=30d" />
        <Kpi label="Revenue · MTD" value={formatMoney(mtdStats.grossCents, 'USD')} sub={`${mtdStats.ordersCount} order${mtdStats.ordersCount === 1 ? '' : 's'}`} accent="emerald" href="/admin-dashboard/reports/revenue?range=mtd" />
      </div>

      {/* Operational KPI row */}
      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Refund rate · 30d" value={`${(refundRate30 * 100).toFixed(1)}%`} sub={`${last30Stats.refundCount} refunds`} accent="amber" href="/admin-dashboard/orders?status=REFUNDED" />
        <Kpi label="Signups · 30d" value={signups30.toLocaleString()} sub="new users" accent="blue" href="/admin-dashboard/users" />
        <Kpi label="Active learners · 30d" value={activeLearners30.toLocaleString()} sub="unique attempts" accent="blue" href="/admin-dashboard/users" />
        <Kpi label="DRAFT questions" value={questionDrafts.toLocaleString()} sub="awaiting review" accent={questionDrafts > 0 ? 'rose' : 'slate'} href="/admin-dashboard/exams" />
      </div>

      {/* Tax (MTD) helper */}
      <div className="card mb-4 p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Tax collected · MTD</div>
            <div className="mt-0.5 text-lg font-semibold">{formatMoney(taxMtd.taxSgdTotal, 'SGD')}</div>
            <div className="text-xs text-slate-500">{taxMtd.invoiceCount} invoice{taxMtd.invoiceCount === 1 ? '' : 's'} · SGD-equivalent total {formatMoney(taxMtd.totalSgd, 'SGD')}</div>
          </div>
          <Link href="/admin-dashboard/reports/tax" className="btn-sm bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">
            GST report →
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Latest users</h2>
            <Link href="/admin-dashboard/users" className="text-xs text-blue-600 hover:underline dark:text-blue-400">View all →</Link>
          </div>
          <ul className="divide-y divide-slate-100 text-[12px] dark:divide-slate-800/70">
            {latestUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-1.5">
                <div className="min-w-0">
                  <div className="truncate font-medium">{u.name || u.email}</div>
                  <div className="truncate text-xs text-slate-500">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  {!u.active && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[11px] font-semibold text-red-800">OFF</span>}
                  <span className="text-[11px] text-slate-500">{u.createdAt.toLocaleDateString()}</span>
                </div>
              </li>
            ))}
            {latestUsers.length === 0 && <li className="py-3 text-[12px] text-slate-500">No users yet.</li>}
          </ul>
        </section>

        <section className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Latest orders</h2>
            <Link href="/admin-dashboard/orders" className="text-xs text-blue-600 hover:underline dark:text-blue-400">View all →</Link>
          </div>
          <ul className="divide-y divide-slate-100 text-[12px] dark:divide-slate-800/70">
            {latestOrders.map((o) => {
              const product = o.bundle ? `${o.bundle.title} (bundle)` : o.exam?.title ?? '—';
              const tier = o.tier ? tierLabel(o.tier) : o.bundle ? 'Practice Exam' : '—';
              return (
                <li key={o.id} className="flex items-center justify-between gap-2 py-1.5">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{product}</div>
                    <div className="truncate text-xs text-slate-500">{o.user.email} · {tier}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatMoney(o.amount, o.currency)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </li>
              );
            })}
            {latestOrders.length === 0 && <li className="py-3 text-[12px] text-slate-500">No orders yet.</li>}
          </ul>
        </section>
      </div>

      <section className="mt-4 card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Popular practice exams (paid orders)</h2>
          <Link href="/admin-dashboard/reports/exams" className="text-xs text-blue-600 hover:underline dark:text-blue-400">Full exam report →</Link>
        </div>
        <ul className="divide-y divide-slate-100 text-[12px] dark:divide-slate-800/70">
          {popularOrders.map((p, i) => {
            const exam = popularExamMap.get(p.examId!);
            if (!exam) return null;
            return (
              <li key={p.examId} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {i + 1}
                  </span>
                  <div>
                    <Link href={`/admin-dashboard/exams/${exam.id}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                      {exam.vendor.name} · {exam.code}
                    </Link>
                    <div className="text-xs text-slate-500">{exam.title}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-500">{p._count.examId} paid order{p._count.examId === 1 ? '' : 's'}</div>
              </li>
            );
          })}
          {popularOrders.length === 0 && <li className="py-3 text-[12px] text-slate-500">No paid orders yet.</li>}
        </ul>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  accent,
  href
}: {
  label: string;
  value: string;
  sub?: string;
  accent: 'emerald' | 'blue' | 'amber' | 'rose' | 'slate';
  href: string;
}) {
  const colors: Record<string, string> = {
    emerald: 'border-l-emerald-500',
    blue: 'border-l-blue-500',
    amber: 'border-l-amber-500',
    rose: 'border-l-rose-500',
    slate: 'border-l-slate-400'
  };
  return (
    <Link href={href} className={`card flex flex-col gap-0.5 border-l-2 p-3 transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${colors[accent]}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{value}</div>
      {sub && <div className="text-[11px] text-slate-500">{sub}</div>}
    </Link>
  );
}
