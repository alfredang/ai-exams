import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Prisma, EmailStatus } from '@prisma/client';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar, FilterField } from '@/components/admin/filter-bar';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Pager } from '@/components/admin/pager';
import { StatusBadge } from '@/components/admin/badge';
import { buildQS } from '@/components/admin/qs';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

type SearchParams = Promise<{
  q?: string;
  template?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: string;
}>;

type Row = Awaited<ReturnType<typeof loadLogs>>[number];

async function loadLogs(where: Prisma.EmailLogWhereInput, skip: number, take: number) {
  return db.emailLog.findMany({
    where,
    include: { user: { select: { id: true, email: true } } },
    orderBy: { sentAt: 'desc' },
    skip,
    take
  });
}

export default async function EmailLogPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const sp = await searchParams;
  const q = (sp.q || '').trim();
  const template = (sp.template || '').trim();
  const status = sp.status as EmailStatus | undefined;
  const fromStr = (sp.from || '').trim();
  const toStr = (sp.to || '').trim();
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.EmailLogWhereInput = {};
  if (q) where.OR = [
    { to: { contains: q, mode: 'insensitive' } },
    { subject: { contains: q, mode: 'insensitive' } }
  ];
  if (template) where.template = template;
  if (status && ['QUEUED', 'SENT', 'FAILED', 'BOUNCED', 'OPENED'].includes(status)) where.status = status;
  const fromDate = fromStr ? new Date(fromStr) : null;
  const toDate = toStr ? new Date(toStr) : null;
  if (toDate) toDate.setHours(23, 59, 59, 999);
  if ((fromDate && !isNaN(fromDate.getTime())) || (toDate && !isNaN(toDate.getTime()))) {
    where.sentAt = {
      ...(fromDate && !isNaN(fromDate.getTime()) ? { gte: fromDate } : {}),
      ...(toDate && !isNaN(toDate.getTime()) ? { lte: toDate } : {})
    };
  }

  const [total, rows, templates] = await Promise.all([
    db.emailLog.count({ where }),
    loadLogs(where, (page - 1) * PAGE_SIZE, PAGE_SIZE),
    db.emailLog.findMany({ distinct: ['template'], select: { template: true }, orderBy: { template: 'asc' } })
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const baseParams = { q, template, status, from: fromStr, to: toStr };
  const buildHref = (p: number) =>
    `/admin-dashboard/emails${buildQS({ ...baseParams, page: p === 1 ? undefined : p })}`;

  const activeFilters = [
    q && { key: 'search', label: q, clearHref: `/admin-dashboard/emails${buildQS({ ...baseParams, q: undefined })}` },
    template && { key: 'template', label: template, clearHref: `/admin-dashboard/emails${buildQS({ ...baseParams, template: undefined })}` },
    status && { key: 'status', label: status, clearHref: `/admin-dashboard/emails${buildQS({ ...baseParams, status: undefined })}` },
    fromStr && { key: 'from', label: fromStr, clearHref: `/admin-dashboard/emails${buildQS({ ...baseParams, from: undefined })}` },
    toStr && { key: 'to', label: toStr, clearHref: `/admin-dashboard/emails${buildQS({ ...baseParams, to: undefined })}` }
  ].filter(Boolean) as { key: string; label: string; clearHref: string }[];

  const columns: Column<Row>[] = [
    {
      key: 'sent',
      header: 'Sent',
      cell: (r) => <span className="whitespace-nowrap text-xs text-slate-700 dark:text-slate-200">{r.sentAt.toLocaleString()}</span>
    },
    {
      key: 'to',
      header: 'Recipient',
      cell: (r) => (
        <div>
          {r.user ? (
            <Link href={`/admin-dashboard/users/${r.user.id}?tab=emails`} className="text-blue-600 hover:underline dark:text-blue-400">
              {r.to}
            </Link>
          ) : (
            <span>{r.to}</span>
          )}
          {r.cc && <div className="text-[11px] text-slate-500">cc: {r.cc}</div>}
        </div>
      )
    },
    {
      key: 'template',
      header: 'Template',
      cell: (r) => <span className="font-mono text-xs">{r.template ?? '—'}</span>
    },
    {
      key: 'subject',
      header: 'Subject',
      cell: (r) => <span className="truncate text-[12px]">{r.subject}</span>
    },
    {
      key: 'transport',
      header: 'Via',
      cell: (r) => <span className="text-[11px] text-slate-500">{r.transport}</span>
    },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => (
        <div>
          <StatusBadge status={r.status} />
          {r.error && <div className="mt-0.5 truncate text-[11px] text-red-600" title={r.error}>{r.error.slice(0, 40)}</div>}
        </div>
      )
    },
    {
      key: 'vars',
      header: 'Vars',
      align: 'right',
      headerClassName: 'w-20',
      cell: (r) =>
        r.payloadVars ? (
          <details className="text-right">
            <summary className="cursor-pointer text-xs text-blue-600 hover:underline dark:text-blue-400">View</summary>
            <pre className="mt-1 max-h-72 overflow-auto rounded bg-slate-100 p-2 text-left text-[11px] dark:bg-slate-800">
{JSON.stringify(r.payloadVars, null, 2)}
            </pre>
          </details>
        ) : (
          <span className="text-slate-400">—</span>
        )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Email log"
        subtitle={`${total} email${total === 1 ? '' : 's'}${pages > 1 ? ` · page ${page} of ${pages}` : ''}`}
      />

      <FilterBar resetHref={activeFilters.length > 0 ? '/admin-dashboard/emails' : undefined} activeFilters={activeFilters}>
        <FilterField label="Search" className="min-w-[14rem] flex-1">
          <input name="q" defaultValue={q} placeholder="Recipient or subject…" className="input-sm" />
        </FilterField>
        <FilterField label="Template">
          <select name="template" defaultValue={template} className="input-sm">
            <option value="">All templates</option>
            {templates.filter((t) => t.template).map((t) => (
              <option key={t.template!} value={t.template!}>{t.template}</option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Status">
          <select name="status" defaultValue={status ?? ''} className="input-sm">
            <option value="">All statuses</option>
            <option>SENT</option>
            <option>FAILED</option>
            <option>BOUNCED</option>
            <option>OPENED</option>
            <option>QUEUED</option>
          </select>
        </FilterField>
        <FilterField label="From">
          <input type="date" name="from" defaultValue={fromStr} className="input-sm" />
        </FilterField>
        <FilterField label="To">
          <input type="date" name="to" defaultValue={toStr} className="input-sm" />
        </FilterField>
      </FilterBar>

      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} empty="No emails logged yet." />

      <Pager page={page} pages={pages} buildHref={buildHref} />
    </div>
  );
}
