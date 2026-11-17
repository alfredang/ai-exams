import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { formatMoney } from '@/lib/utils';
import { PageHeader } from '@/components/admin/page-header';
import { StatCard } from '@/components/admin/stat-card';
import { db } from '@/lib/db';
import { paidOrdersIn, signupsIn, activeLearnersIn, taxCollectedIn, Ranges } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

/** Money dashboard: the revenue, refund, signup and GST KPIs that used to lead the main dashboard. */
export default async function MoneyDashboard() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');

  const last30 = Ranges.lastNDays(30);
  const [todayStats, last7Stats, last30Stats, mtdStats, taxMtd, signups30, activeLearners30, questionFlags] = await Promise.all([
    paidOrdersIn(Ranges.today()),
    paidOrdersIn(Ranges.lastNDays(7)),
    paidOrdersIn(last30),
    paidOrdersIn(Ranges.mtd()),
    taxCollectedIn(Ranges.mtd()),
    signupsIn(last30),
    activeLearnersIn(last30),
    db.question.count({ where: { status: 'PUBLISHED', auditFlag: { not: null } } })
  ]);

  const refundRate30 = last30Stats.ordersCount ? last30Stats.refundCount / last30Stats.ordersCount : 0;
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

  return (
    <div>
      <PageHeader title="Money dashboard" subtitle="Revenue, refunds and GST at a glance. Click any card to drill into the report." />

      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue today" value={formatMoney(todayStats.grossCents, 'USD')} sub={plural(todayStats.ordersCount, 'order')} accent="emerald" href="/admin-dashboard/reports/revenue?range=today" />
        <StatCard label="Revenue · 7d" value={formatMoney(last7Stats.grossCents, 'USD')} sub={`AOV ${formatMoney(last7Stats.aovCents, 'USD')}`} accent="emerald" href="/admin-dashboard/reports/revenue?range=7d" />
        <StatCard label="Revenue · 30d" value={formatMoney(last30Stats.grossCents, 'USD')} sub={`Net ${formatMoney(last30Stats.netCents, 'USD')}`} accent="emerald" href="/admin-dashboard/reports/revenue?range=30d" />
        <StatCard label="Revenue · MTD" value={formatMoney(mtdStats.grossCents, 'USD')} sub={plural(mtdStats.ordersCount, 'order')} accent="emerald" href="/admin-dashboard/reports/revenue?range=mtd" />
      </div>

      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Refund rate · 30d" value={`${(refundRate30 * 100).toFixed(1)}%`} sub={plural(last30Stats.refundCount, 'refund')} accent="amber" href="/admin-dashboard/orders?status=REFUNDED" />
        <StatCard label="Signups · 30d" value={signups30.toLocaleString()} sub="new users" accent="brand" href="/admin-dashboard/users" />
        <StatCard label="Active learners · 30d" value={activeLearners30.toLocaleString()} sub="unique attempts" accent="brand" href="/admin-dashboard/users" />
        <StatCard label="Flagged questions" value={questionFlags.toLocaleString()} sub="may be wrong or outdated" accent={questionFlags > 0 ? 'rose' : 'slate'} href="/admin-dashboard/questions#audit-flags" />
      </div>

      <StatCard
        label="Tax collected · MTD"
        value={formatMoney(taxMtd.taxUsdTotal, 'USD')}
        sub={`GST included · ${plural(taxMtd.invoiceCount, 'invoice')} · total ${formatMoney(taxMtd.totalUsd, 'USD')}`}
        action={<Link href="/admin-dashboard/reports/tax" className="btn-sm-quiet shrink-0">GST report →</Link>}
      />
    </div>
  );
}
