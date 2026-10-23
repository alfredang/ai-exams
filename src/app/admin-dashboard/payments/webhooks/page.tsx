import Link from 'next/link';
import { db } from '@/lib/db';
import type { Prisma, PaymentProvider, WebhookStatus } from '@prisma/client';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar, FilterField } from '@/components/admin/filter-bar';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Pager } from '@/components/admin/pager';
import { StatusBadge } from '@/components/admin/badge';
import { buildQS } from '@/components/admin/qs';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

type SearchParams = Promise<{
  provider?: string;
  status?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: string;
}>;

type EventRow = Awaited<ReturnType<typeof loadEvents>>[number];

async function loadEvents(where: Prisma.PaymentWebhookEventWhereInput, skip: number, take: number) {
  return db.paymentWebhookEvent.findMany({
    where,
    include: { order: { select: { id: true, number: true } } },
    orderBy: { receivedAt: 'desc' },
    skip,
    take
  });
}

export default async function WebhookEventsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const provider = sp.provider as PaymentProvider | undefined;
  const status = sp.status as WebhookStatus | undefined;
  const fromStr = (sp.from || '').trim();
  const toStr = (sp.to || '').trim();
  const q = (sp.q || '').trim();
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.PaymentWebhookEventWhereInput = {};
  if (provider && ['PAYPAL', 'HITPAY', 'PAYNOW', 'TEST'].includes(provider)) where.provider = provider;
  if (status && ['RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED'].includes(status)) where.status = status;
  const fromDate = fromStr ? new Date(fromStr) : null;
  const toDate = toStr ? new Date(toStr) : null;
  if (toDate) toDate.setHours(23, 59, 59, 999);
  if ((fromDate && !isNaN(fromDate.getTime())) || (toDate && !isNaN(toDate.getTime()))) {
    where.receivedAt = {
      ...(fromDate && !isNaN(fromDate.getTime()) ? { gte: fromDate } : {}),
      ...(toDate && !isNaN(toDate.getTime()) ? { lte: toDate } : {})
    };
  }
  if (q) {
    where.OR = [
      { eventId: { contains: q, mode: 'insensitive' } },
      { eventType: { contains: q, mode: 'insensitive' } },
      { error: { contains: q, mode: 'insensitive' } }
    ];
  }

  const [total, rows] = await Promise.all([
    db.paymentWebhookEvent.count({ where }),
    loadEvents(where, (page - 1) * PAGE_SIZE, PAGE_SIZE)
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const baseParams = { provider, status, from: fromStr, to: toStr, q };
  const buildHref = (p: number) =>
    `/admin-dashboard/payments/webhooks${buildQS({ ...baseParams, page: p === 1 ? undefined : p })}`;

  const activeFilters = [
    provider && {
      key: 'provider', label: provider,
      clearHref: `/admin-dashboard/payments/webhooks${buildQS({ ...baseParams, provider: undefined })}`
    },
    status && {
      key: 'status', label: status,
      clearHref: `/admin-dashboard/payments/webhooks${buildQS({ ...baseParams, status: undefined })}`
    },
    q && {
      key: 'search', label: q,
      clearHref: `/admin-dashboard/payments/webhooks${buildQS({ ...baseParams, q: undefined })}`
    },
    fromStr && { key: 'from', label: fromStr, clearHref: `/admin-dashboard/payments/webhooks${buildQS({ ...baseParams, from: undefined })}` },
    toStr && { key: 'to', label: toStr, clearHref: `/admin-dashboard/payments/webhooks${buildQS({ ...baseParams, to: undefined })}` }
  ].filter(Boolean) as { key: string; label: string; clearHref: string }[];

  const columns: Column<EventRow>[] = [
    {
      key: 'when',
      header: 'Received',
      cell: (e) => (
        <span className="whitespace-nowrap text-[12px] text-slate-700 dark:text-slate-200">{e.receivedAt.toLocaleString()}</span>
      )
    },
    {
      key: 'provider',
      header: 'Provider',
      cell: (e) => <span className="font-mono text-xs">{e.provider}</span>
    },
    {
      key: 'eventType',
      header: 'Event',
      cell: (e) => (
        <div>
          <div className="font-mono text-xs text-slate-800 dark:text-slate-200">{e.eventType}</div>
          <div className="font-mono text-[11px] text-slate-500" title={e.eventId}>{e.eventId.slice(0, 18)}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      cell: (e) => <StatusBadge status={e.status} />
    },
    {
      key: 'order',
      header: 'Order',
      cell: (e) =>
        e.order ? (
          <Link
            href={`/admin-dashboard/orders/${e.order.id}`}
            className="font-mono text-xs text-blue-600 hover:underline dark:text-blue-400"
          >
            {e.order.number ?? e.order.id.slice(0, 10)}
          </Link>
        ) : (
          <span className="text-slate-400">—</span>
        )
    },
    {
      key: 'error',
      header: 'Error / Note',
      cell: (e) =>
        e.error ? (
          <span className="text-xs text-red-600" title={e.error}>{e.error.slice(0, 60)}</span>
        ) : (
          <span className="text-slate-400">—</span>
        )
    },
    {
      key: 'payload',
      header: 'Payload',
      align: 'right',
      headerClassName: 'w-20',
      cell: (e) => (
        <details className="text-right">
          <summary className="cursor-pointer text-xs text-blue-600 hover:underline dark:text-blue-400">View</summary>
          <pre className="mt-1 max-h-72 overflow-auto rounded bg-slate-100 p-2 text-left text-[11px] dark:bg-slate-800">
{JSON.stringify(e.payload, null, 2)}
          </pre>
        </details>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Webhook Events"
        subtitle={`${total} event${total === 1 ? '' : 's'}${pages > 1 ? ` · page ${page} of ${pages}` : ''}`}
      />

      <FilterBar
        resetHref={activeFilters.length > 0 ? '/admin-dashboard/payments/webhooks' : undefined}
        activeFilters={activeFilters}
      >
        <FilterField label="Provider">
          <select name="provider" defaultValue={provider ?? ''} className="input-sm">
            <option value="">All providers</option>
            <option>PAYPAL</option>
            <option>HITPAY</option>
            <option>PAYNOW</option>
            <option>TEST</option>
          </select>
        </FilterField>
        <FilterField label="Status">
          <select name="status" defaultValue={status ?? ''} className="input-sm">
            <option value="">All statuses</option>
            <option>RECEIVED</option>
            <option>PROCESSED</option>
            <option>FAILED</option>
            <option>IGNORED</option>
          </select>
        </FilterField>
        <FilterField label="Search" className="min-w-[12rem]">
          <input name="q" defaultValue={q} placeholder="Event id, type, error…" className="input-sm" />
        </FilterField>
        <FilterField label="From">
          <input type="date" name="from" defaultValue={fromStr} className="input-sm" />
        </FilterField>
        <FilterField label="To">
          <input type="date" name="to" defaultValue={toStr} className="input-sm" />
        </FilterField>
      </FilterBar>

      <DataTable columns={columns} rows={rows} rowKey={(e) => e.id} empty="No webhook events match the filters." />

      <Pager page={page} pages={pages} buildHref={buildHref} />
    </div>
  );
}
