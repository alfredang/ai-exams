import Link from 'next/link';
import { db } from '@/lib/db';
import type { Prisma, InvoiceStatus } from '@prisma/client';
import { Eye, FileText } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar, FilterField } from '@/components/admin/filter-bar';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Pager } from '@/components/admin/pager';
import { StatusBadge } from '@/components/admin/badge';
import { buildQS } from '@/components/admin/qs';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

type SearchParams = Promise<{
  q?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: string;
}>;

type InvoiceRow = Awaited<ReturnType<typeof loadInvoices>>[number];

async function loadInvoices(where: Prisma.InvoiceWhereInput, skip: number, take: number) {
  return db.invoice.findMany({
    where,
    include: {
      user: { select: { email: true, name: true } },
      order: { include: { exam: { select: { code: true, title: true, vendor: { select: { name: true } } } }, bundle: { select: { title: true } } } },
      creditNoteOf: { select: { order: { include: { exam: { select: { code: true, title: true, vendor: { select: { name: true } } } }, bundle: { select: { title: true } } } } } }
    },
    orderBy: { issueDate: 'desc' },
    skip,
    take
  });
}

export default async function AdminInvoicesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = (sp.q || '').trim();
  const status = sp.status as InvoiceStatus | undefined;
  const fromStr = (sp.from || '').trim();
  const toStr = (sp.to || '').trim();
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.InvoiceWhereInput = {};
  if (status && ['ISSUED', 'VOID', 'CREDIT_NOTE'].includes(status)) where.status = status;
  const fromDate = fromStr ? new Date(fromStr) : null;
  const toDate = toStr ? new Date(toStr) : null;
  if (toDate) toDate.setHours(23, 59, 59, 999);
  if ((fromDate && !isNaN(fromDate.getTime())) || (toDate && !isNaN(toDate.getTime()))) {
    where.issueDate = {
      ...(fromDate && !isNaN(fromDate.getTime()) ? { gte: fromDate } : {}),
      ...(toDate && !isNaN(toDate.getTime()) ? { lte: toDate } : {})
    };
  }
  if (q) {
    where.OR = [
      { number: { contains: q, mode: 'insensitive' } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
      { user: { name: { contains: q, mode: 'insensitive' } } },
      { billingName: { contains: q, mode: 'insensitive' } }
    ];
  }

  const [total, invoices, agg] = await Promise.all([
    db.invoice.count({ where }),
    loadInvoices(where, (page - 1) * PAGE_SIZE, PAGE_SIZE),
    db.invoice.aggregate({ where, _sum: { totalSgd: true, taxAmount: true } })
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const baseParams = { q, status, from: fromStr, to: toStr };
  const buildHref = (p: number) =>
    `/admin-dashboard/invoices${buildQS({ ...baseParams, page: p === 1 ? undefined : p })}`;

  const activeFilters = [
    q && { key: 'search', label: q, clearHref: `/admin-dashboard/invoices${buildQS({ ...baseParams, q: undefined })}` },
    status && { key: 'status', label: status, clearHref: `/admin-dashboard/invoices${buildQS({ ...baseParams, status: undefined })}` },
    fromStr && { key: 'from', label: fromStr, clearHref: `/admin-dashboard/invoices${buildQS({ ...baseParams, from: undefined })}` },
    toStr && { key: 'to', label: toStr, clearHref: `/admin-dashboard/invoices${buildQS({ ...baseParams, to: undefined })}` }
  ].filter(Boolean) as { key: string; label: string; clearHref: string }[];

  const columns: Column<InvoiceRow>[] = [
    {
      key: 'number',
      header: 'Invoice',
      cell: (i) => (
        <Link
          href={`/admin-dashboard/invoices/${i.id}`}
          className="font-mono text-[12px] font-semibold text-slate-900 hover:underline dark:text-slate-100"
        >
          {i.number}
        </Link>
      )
    },
    {
      key: 'date',
      header: 'Issue Date',
      cell: (i) => <span className="text-[12px] text-slate-700 dark:text-slate-200">{i.issueDate.toISOString().slice(0, 10)}</span>
    },
    {
      key: 'name',
      header: 'Name',
      cell: (i) => <span className="text-[12px] text-slate-900 dark:text-slate-100">{i.billingName}</span>
    },
    {
      key: 'email',
      header: 'Email',
      cell: (i) => <span className="text-[12px] text-slate-700 dark:text-slate-200">{i.billingEmail}</span>
    },
    {
      key: 'product',
      header: 'Product',
      cell: (i) => {
        const o = i.order ?? i.creditNoteOf?.order;
        const label = o?.bundle
          ? `${o.bundle.title} (bundle)`
          : o?.exam
            ? `${o.exam.title} (${o.exam.code})`
            : 'Order';
        return <span className="text-[12px] text-slate-700 dark:text-slate-200">{label}</span>;
      }
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      cell: (i) => (
        <div className="text-right">
          <div className="font-semibold text-slate-900 dark:text-slate-100">{formatPrice(i.total, i.currency)}</div>
          {i.totalSgd != null && i.currency.toUpperCase() !== 'SGD' && (
            <div className="text-[10px] text-slate-500">≈ {formatPrice(i.totalSgd, 'SGD')}</div>
          )}
        </div>
      )
    },
    {
      key: 'tax',
      header: 'Tax',
      align: 'right',
      cell: (i) =>
        i.taxAmount === 0 ? (
          <span className="text-slate-400">—</span>
        ) : (
          <span className="text-[12px]">{formatPrice(i.taxAmount, i.currency)}</span>
        )
    },
    {
      key: 'status',
      header: 'Status',
      cell: (i) => <StatusBadge status={i.status} />
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      headerClassName: 'w-20',
      cell: (i) => (
        <div className="flex items-center justify-end gap-0.5">
          <a href={`/api/admin/invoices/${i.id}/pdf`} target="_blank" rel="noreferrer" title="Open PDF" className="icon-btn">
            <FileText className="h-3.5 w-3.5" />
          </a>
          <Link href={`/admin-dashboard/invoices/${i.id}`} title="View invoice" className="icon-btn">
            <Eye className="h-3.5 w-3.5" />
          </Link>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={`${total} invoice${total === 1 ? '' : 's'}${pages > 1 ? ` · page ${page} of ${pages}` : ''}${
          agg._sum.totalSgd ? ` · SGD total ${formatPrice(agg._sum.totalSgd, 'SGD')}` : ''
        }${agg._sum.taxAmount ? ` · tax ${formatPrice(agg._sum.taxAmount, 'SGD')}` : ''}`}
      />

      <FilterBar resetHref={activeFilters.length > 0 ? '/admin-dashboard/invoices' : undefined} activeFilters={activeFilters}>
        <FilterField label="Search" className="min-w-[14rem] flex-1">
          <input name="q" defaultValue={q} placeholder="Number, customer email…" className="input-sm" />
        </FilterField>
        <FilterField label="Status">
          <select name="status" defaultValue={status ?? ''} className="input-sm">
            <option value="">All statuses</option>
            <option>ISSUED</option>
            <option>VOID</option>
            <option>CREDIT_NOTE</option>
          </select>
        </FilterField>
        <FilterField label="From">
          <input type="date" name="from" defaultValue={fromStr} className="input-sm" />
        </FilterField>
        <FilterField label="To">
          <input type="date" name="to" defaultValue={toStr} className="input-sm" />
        </FilterField>
      </FilterBar>

      <DataTable columns={columns} rows={invoices} rowKey={(i) => i.id} empty="No invoices match the filters." />

      <Pager page={page} pages={pages} buildHref={buildHref} />
    </div>
  );
}
