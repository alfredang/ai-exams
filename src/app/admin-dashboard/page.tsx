import Link from 'next/link';
import { db } from '@/lib/db';
import { tierLabel } from '@/lib/utils';
import { formatOrderUsd, loadUsdSnapshots } from '@/lib/order-usd';
import { PageHeader } from '@/components/admin/page-header';
import { Badge, StatusBadge } from '@/components/admin/badge';
import { StatCard } from '@/components/admin/stat-card';
import { activeLearnersIn, practiceAttemptsIn, vouchersPurchasedIn, Ranges } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const last7 = Ranges.lastNDays(7);
  const last30 = Ranges.lastNDays(30);

  const [
    activeUsers30,
    activeUsers7,
    attempts30,
    attempts7,
    attemptsAll,
    vouchers30,
    vouchers7,
    vouchersAll,
    latestUsers,
    latestOrders,
    popularOrders
  ] = await Promise.all([
    activeLearnersIn(last30),
    activeLearnersIn(last7),
    practiceAttemptsIn(last30),
    practiceAttemptsIn(last7),
    practiceAttemptsIn(null),
    vouchersPurchasedIn(last30),
    vouchersPurchasedIn(last7),
    vouchersPurchasedIn(null),
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
    })
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

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Usage at a glance. Revenue, refunds and GST are on the Money dashboard." />

      {/* Usage KPIs — money KPIs live on the Money dashboard (/admin-dashboard/money). */}
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <StatCard label="Active users · 30d" value={activeUsers30.toLocaleString()} sub={`took an exam · 7d ${activeUsers7.toLocaleString()}`} accent="brand" href="/admin-dashboard/users" />
        <StatCard label="Practice exam attempts · 30d" value={attempts30.toLocaleString()} sub={`7d ${attempts7.toLocaleString()} · all time ${attemptsAll.toLocaleString()}`} accent="brand" href="/admin-dashboard/reports/exams" />
        <StatCard label="Vouchers purchased · 30d" value={vouchers30.toLocaleString()} sub={`7d ${vouchers7.toLocaleString()} · all time ${vouchersAll.toLocaleString()}`} accent="emerald" href="/admin-dashboard/vouchers" />
      </div>

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
