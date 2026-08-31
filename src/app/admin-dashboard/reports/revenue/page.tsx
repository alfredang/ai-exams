import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { paidOrdersIn, revenueBy } from '@/lib/analytics';
import { rangeFromSearchParams, RANGE_OPTIONS } from '@/lib/reports/range-from-sp';
import { PageHeader } from '@/components/admin/page-header';
import { Download } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ range?: string; from?: string; to?: string; by?: string }>;

export default async function RevenueReportPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const sp = await searchParams;
  const { range, label } = rangeFromSearchParams(sp);
  const by = (sp.by as any) || 'exam';
  const validBy = ['exam', 'vendor', 'tier', 'day', 'month'].includes(by) ? by : 'exam';

  const [totals, breakdown] = await Promise.all([
    paidOrdersIn(range),
    revenueBy(validBy as any, range)
  ]);

  const exportHref = `/api/admin/reports/revenue/export?range=${sp.range ?? '30d'}${sp.from ? `&from=${sp.from}` : ''}${sp.to ? `&to=${sp.to}` : ''}&by=${validBy}`;

  return (
    <div>
      <PageHeader
        title="Revenue"
        subtitle={`${label} · ${totals.ordersCount} order${totals.ordersCount === 1 ? '' : 's'}`}
        actions={
          <a href={exportHref} download className="btn-sm bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">
            <Download className="mr-1 h-3.5 w-3.5" /> Export CSV
          </a>
        }
      />

      {/* Range + dimension picker */}
      <form method="get" className="card mb-3 flex flex-wrap items-end gap-2 p-3">
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Range</span>
          <select name="range" defaultValue={sp.range ?? '30d'} className="input-sm">
            {RANGE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
          </select>
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">From</span>
          <input type="date" name="from" defaultValue={sp.from ?? ''} className="input-sm" />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">To</span>
          <input type="date" name="to" defaultValue={sp.to ?? ''} className="input-sm" />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Group by</span>
          <select name="by" defaultValue={validBy} className="input-sm">
            <option value="exam">Exam</option>
            <option value="vendor">Vendor</option>
            <option value="tier">Tier</option>
            <option value="day">Day</option>
            <option value="month">Month</option>
          </select>
        </label>
        <button className="ml-auto inline-flex h-8 items-center rounded-md bg-blue-600 px-3 text-[12px] font-medium text-white hover:bg-blue-700">
          Apply
        </button>
      </form>

      {/* Totals strip */}
      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Gross" value={formatPrice(totals.grossCents, 'USD')} />
        <Stat label="Discounts" value={`−${formatPrice(totals.discountCents, 'USD')}`} />
        <Stat label="Refunds" value={`−${formatPrice(totals.refundedCents, 'USD')}`} />
        <Stat label="Net" value={formatPrice(totals.netCents, 'USD')} accent="emerald" />
      </div>

      {/* Breakdown table */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-[13px]">
          <thead className="border-b border-slate-200 bg-slate-50/60 text-left text-[10px] uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/40">
            <tr>
              <th className="px-3 py-2 font-medium">{validBy === 'day' ? 'Date' : validBy === 'month' ? 'Month' : validBy === 'tier' ? 'Tier' : validBy === 'vendor' ? 'Vendor' : 'Exam'}</th>
              <th className="px-3 py-2 text-right font-medium">Orders</th>
              <th className="px-3 py-2 text-right font-medium">Revenue</th>
              <th className="px-3 py-2 text-right font-medium">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {breakdown.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-[12px] text-slate-500">No paid orders in this range.</td></tr>
            )}
            {breakdown.map((b) => (
              <tr key={b.key}>
                <td className="px-3 py-1.5">{b.label}</td>
                <td className="px-3 py-1.5 text-right">{b.count}</td>
                <td className="px-3 py-1.5 text-right font-semibold">{formatPrice(b.amount, b.currency)}</td>
                <td className="px-3 py-1.5 text-right text-slate-500">
                  {totals.grossCents > 0 ? `${((b.amount / totals.grossCents) * 100).toFixed(1)}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: 'emerald' }) {
  return (
    <div className={`card p-3 ${accent === 'emerald' ? 'border-l-2 border-l-emerald-500' : ''}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-lg font-semibold tracking-tight">{value}</div>
    </div>
  );
}
