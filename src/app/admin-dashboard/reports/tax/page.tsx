import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { taxCollectedIn } from '@/lib/analytics';
import { rangeFromSearchParams, RANGE_OPTIONS } from '@/lib/reports/range-from-sp';
import { PageHeader } from '@/components/admin/page-header';
import { formatMoney } from '@/lib/utils';
import { Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ range?: string; from?: string; to?: string }>;

export default async function TaxReportPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const sp = await searchParams;
  const { range, label } = rangeFromSearchParams(sp);
  const tax = await taxCollectedIn(range);

  const invoices = await db.invoice.findMany({
    where: { issueDate: { gte: range.from, lte: range.to }, status: 'ISSUED' },
    orderBy: { issueDate: 'asc' },
    select: {
      id: true, number: true, issueDate: true, currency: true,
      subtotal: true, taxAmount: true, taxRate: true, taxLabel: true,
      total: true, totalSgd: true, fxRateBpsToSgd: true, billingName: true, billingEmail: true
    }
  });

  const exportHref = `/api/admin/reports/tax/export?range=${sp.range ?? '30d'}${sp.from ? `&from=${sp.from}` : ''}${sp.to ? `&to=${sp.to}` : ''}`;

  return (
    <div>
      <PageHeader
        title="Tax (GST) report"
        subtitle={`${label} · ${tax.invoiceCount} invoice${tax.invoiceCount === 1 ? '' : 's'}`}
        actions={
          <a href={exportHref} download className="btn-sm bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">
            <Download className="mr-1 h-3.5 w-3.5" /> Export CSV
          </a>
        }
      />

      <form method="get" className="card mb-3 flex flex-wrap items-end gap-2 p-3">
        <label className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Range</span>
          <select name="range" defaultValue={sp.range ?? '30d'} className="input-sm">
            {RANGE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
          </select>
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">From</span>
          <input type="date" name="from" defaultValue={sp.from ?? ''} className="input-sm" />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">To</span>
          <input type="date" name="to" defaultValue={sp.to ?? ''} className="input-sm" />
        </label>
        <button className="ml-auto inline-flex h-8 items-center rounded-md bg-blue-600 px-3 text-[12px] font-medium text-white hover:bg-blue-700">
          Apply
        </button>
      </form>

      {/* Per-currency summary */}
      <div className="card mb-3 p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">By currency</h2>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
              <th className="py-1">Currency</th>
              <th className="py-1 text-right">Invoices</th>
              <th className="py-1 text-right">Total</th>
              <th className="py-1 text-right">Tax</th>
              <th className="py-1 text-right">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {Object.keys(tax.byCurrency).length === 0 && (
              <tr><td colSpan={5} className="py-3 text-center text-[12px] text-slate-500">No invoices in this range.</td></tr>
            )}
            {Object.entries(tax.byCurrency).map(([cur, v]) => (
              <tr key={cur}>
                <td className="py-1.5 font-mono">{cur}</td>
                <td className="py-1.5 text-right">{v.count}</td>
                <td className="py-1.5 text-right">{formatMoney(v.total, cur)}</td>
                <td className="py-1.5 text-right font-semibold">{formatMoney(v.tax, cur)}</td>
                <td className="py-1.5 text-right text-slate-500">{(v.rate / 100).toFixed(2)}% {v.label}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="py-2 text-slate-500">SGD equivalent</td>
              <td className="py-2 text-right">{tax.invoiceCount}</td>
              <td className="py-2 text-right">{formatMoney(tax.totalSgd, 'SGD')}</td>
              <td className="py-2 text-right">{formatMoney(tax.taxSgdTotal, 'SGD')}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Invoice line items */}
      <div className="card overflow-x-auto p-0">
        <table className="w-max min-w-full text-[12px]">
          <thead className="border-b border-slate-200 bg-slate-50/60 text-left text-[11px] uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/40">
            <tr>
              <th className="px-3 py-2">Invoice</th>
              <th className="px-3 py-2">Issued</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2 text-right">Subtotal</th>
              <th className="px-3 py-2 text-right">Tax</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-right">Total (SGD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-3 py-1.5 font-mono">{inv.number}</td>
                <td className="px-3 py-1.5">{inv.issueDate.toISOString().slice(0, 10)}</td>
                <td className="px-3 py-1.5">
                  <div>{inv.billingName}</div>
                  <div className="text-[11px] text-slate-500">{inv.billingEmail}</div>
                </td>
                <td className="px-3 py-1.5 text-right">{formatMoney(inv.subtotal, inv.currency)}</td>
                <td className="px-3 py-1.5 text-right">{formatMoney(inv.taxAmount, inv.currency)}</td>
                <td className="px-3 py-1.5 text-right font-semibold">{formatMoney(inv.total, inv.currency)}</td>
                <td className="px-3 py-1.5 text-right text-slate-500">{inv.totalSgd != null ? formatMoney(inv.totalSgd, 'SGD') : '—'}</td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-[12px] text-slate-500">No invoices in this range.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
