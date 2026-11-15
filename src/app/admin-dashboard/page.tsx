import Link from 'next/link';
import { db } from '@/lib/db';
import { formatMoney, tierLabel } from '@/lib/utils';
import { formatOrderUsd, loadUsdSnapshots } from '@/lib/order-usd';
import { PageHeader } from '@/components/admin/page-header';
import { Badge, StatusBadge } from '@/components/admin/badge';
import { StatCard } from '@/components/admin/stat-card';
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
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        tier: true,
        user: { select: { email: true } },
        exam: { select: { title: true, code: true } },
        bundle: { select: { title: true } }
      }
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

  const latestUsd = await loadUsdSnapshots(latestOrders);

  const popularExamIds = popularOrders.map((p) => p.examId!).filter(Boolean);
  const popularExams = popularExamIds.length
    ? await db.exam.findMany({
        where: { id: { in: popularExamIds } },
        select: { id: true, code: true, title: true, vendor: { select: { name: true } } }
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
        <StatCard label="Revenue today" value={formatMoney(todayStats.grossCents, 'USD')} sub={`${todayStats.ordersCount} order${todayStats.ordersCount === 1 ? '' : 's'}`} accent="emerald" href="/admin-dashboard/reports/revenue?range=today" />
        <StatCard label="Revenue · 7d" value={formatMoney(last7Stats.grossCents, 'USD')} sub={`AOV ${formatMoney(last7Stats.aovCents, 'USD')}`} accent="emerald" href="/admin-dashboard/reports/revenue?range=7d" />
        <StatCard label="Revenue · 30d" value={formatMoney(last30Stats.grossCents, 'USD')} sub={`Net ${formatMoney(last30Stats.netCents, 'USD')}`} accent="emerald" href="/admin-dashboard/reports/revenue?range=30d" />
        <StatCard label="Revenue · MTD" value={formatMoney(mtdStats.grossCents, 'USD')} sub={`${mtdStats.ordersCount} order${mtdStats.ordersCount === 1 ? '' : 's'}`} accent="emerald" href="/admin-dashboard/reports/revenue?range=mtd" />
      </div>

      {/* Operational KPI row */}
      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Refund rate · 30d" value={`${(refundRate30 * 100).toFixed(1)}%`} sub={`${last30Stats.refundCount} refunds`} accent="amber" href="/admin-dashboard/orders?status=REFUNDED" />
        <StatCard label="Signups · 30d" value={signups30.toLocaleString()} sub="new users" accent="brand" href="/admin-dashboard/users" />
        <StatCard label="Active learners · 30d" value={activeLearners30.toLocaleString()} sub="unique attempts" accent="brand" href="/admin-dashboard/users" />
        <StatCard label="DRAFT questions" value={questionDrafts.toLocaleString()} sub="awaiting review" accent={questionDrafts > 0 ? 'rose' : 'slate'} href="/admin-dashboard/exams" />
      </div>

      {/* Tax (MTD) helper */}
      <StatCard
        className="mb-4"
        label="Tax collected · MTD"
        value={formatMoney(taxMtd.taxUsdTotal, 'USD')}
        sub={`GST included · ${taxMtd.invoiceCount} invoice${taxMtd.invoiceCount === 1 ? '' : 's'} · total ${formatMoney(taxMtd.totalUsd, 'USD')}`}
        action={<Link href="/admin-dashboard/reports/tax" className="btn-sm-quiet shrink-0">GST report →</Link>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="admin-label">Latest users</h2>
            <Link href="/admin-dashboard/users" className="admin-link text-xs font-medium">View all →</Link>
          </div>
          <ul className="divide-y divide-line/60 text-[13px] dark:divide-slate-800/70">
            {latestUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-1.5">
                <div className="min-w-0">
                  <div className="truncate font-medium">{u.name || u.email}</div>
                  <div className="truncate text-xs text-slate-500">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  {!u.active && <Badge variant="danger">Off</Badge>}
                  <span className="text-[11px] text-slate-500">{u.createdAt.toLocaleDateString()}</span>
                </div>
              </li>
            ))}
            {latestUsers.length === 0 && <li className="py-3 text-[12px] text-slate-500">No users yet.</li>}
          </ul>
        </section>

        <section className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="admin-label">Latest orders</h2>
            <Link href="/admin-dashboard/orders" className="admin-link text-xs font-medium">View all →</Link>
          </div>
          <ul className="divide-y divide-line/60 text-[13px] dark:divide-slate-800/70">
            {latestOrders.map((o) => {
              const product = o.bundle?.title ?? o.exam?.title ?? '—';
              const tier = o.tier ? tierLabel(o.tier) : o.bundle ? 'Practice Exam' : '—';
              return (
                <li key={o.id} className="flex items-center justify-between gap-2 py-1.5">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{product}</div>
                    <div className="truncate text-xs text-slate-500">{o.user.email} · {tier}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatOrderUsd(o.amount, o, latestUsd)}</span>
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
          <h2 className="admin-label">Popular practice exams (paid orders)</h2>
          <Link href="/admin-dashboard/reports/exams" className="admin-link text-xs font-medium">Full exam report →</Link>
        </div>
        <ul className="divide-y divide-line/60 text-[13px] dark:divide-slate-800/70">
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
                    <Link href={`/admin-dashboard/exams/${exam.id}`} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
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
