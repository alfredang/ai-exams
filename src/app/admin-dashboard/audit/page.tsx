import Link from 'next/link';
import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar, FilterField } from '@/components/admin/filter-bar';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Pager } from '@/components/admin/pager';
import { buildQS } from '@/components/admin/qs';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

type SearchParams = Promise<{
  adminId?: string;
  action?: string;
  targetType?: string;
  from?: string;
  to?: string;
  page?: string;
}>;

type LogRow = Awaited<ReturnType<typeof loadLogs>>[number];

async function loadLogs(where: Prisma.AdminLogWhereInput, skip: number, take: number) {
  return db.adminLog.findMany({
    where,
    include: { admin: { select: { email: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    skip,
    take
  });
}

export default async function AuditLogPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const adminId = (sp.adminId || '').trim();
  const actionFilter = (sp.action || '').trim();
  const targetType = (sp.targetType || '').trim();
  const fromStr = (sp.from || '').trim();
  const toStr = (sp.to || '').trim();
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.AdminLogWhereInput = {};
  if (adminId) where.adminId = adminId;
  if (actionFilter) where.action = { contains: actionFilter, mode: 'insensitive' };
  if (targetType) where.targetType = targetType;
  const fromDate = fromStr ? new Date(fromStr) : null;
  const toDate = toStr ? new Date(toStr) : null;
  if (toDate) toDate.setHours(23, 59, 59, 999);
  if ((fromDate && !isNaN(fromDate.getTime())) || (toDate && !isNaN(toDate.getTime()))) {
    where.createdAt = {
      ...(fromDate && !isNaN(fromDate.getTime()) ? { gte: fromDate } : {}),
      ...(toDate && !isNaN(toDate.getTime()) ? { lte: toDate } : {})
    };
  }

  const [total, logs, admins, distinctTypes] = await Promise.all([
    db.adminLog.count({ where }),
    loadLogs(where, (page - 1) * PAGE_SIZE, PAGE_SIZE),
    // Limit "admins" dropdown to users with role=ADMIN
    db.user.findMany({ where: { role: 'ADMIN' }, orderBy: { email: 'asc' }, select: { id: true, email: true, name: true } }),
    db.adminLog.findMany({
      distinct: ['targetType'],
      select: { targetType: true },
      orderBy: { targetType: 'asc' }
    })
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const baseParams = { adminId, action: actionFilter, targetType, from: fromStr, to: toStr };
  const buildHref = (p: number) =>
    `/admin-dashboard/audit${buildQS({ ...baseParams, page: p === 1 ? undefined : p })}`;

  const activeFilters = [
    adminId && {
      key: 'admin',
      label: admins.find((a) => a.id === adminId)?.email ?? adminId,
      clearHref: `/admin-dashboard/audit${buildQS({ ...baseParams, adminId: undefined })}`
    },
    actionFilter && {
      key: 'action',
      label: actionFilter,
      clearHref: `/admin-dashboard/audit${buildQS({ ...baseParams, action: undefined })}`
    },
    targetType && {
      key: 'target',
      label: targetType,
      clearHref: `/admin-dashboard/audit${buildQS({ ...baseParams, targetType: undefined })}`
    },
    fromStr && {
      key: 'from',
      label: fromStr,
      clearHref: `/admin-dashboard/audit${buildQS({ ...baseParams, from: undefined })}`
    },
    toStr && {
      key: 'to',
      label: toStr,
      clearHref: `/admin-dashboard/audit${buildQS({ ...baseParams, to: undefined })}`
    }
  ].filter(Boolean) as { key: string; label: string; clearHref: string }[];

  const columns: Column<LogRow>[] = [
    {
      key: 'when',
      header: 'When',
      cell: (l) => (
        <span className="whitespace-nowrap font-mono text-xs text-slate-700 dark:text-slate-200">
          {l.createdAt.toLocaleString()}
        </span>
      )
    },
    {
      key: 'admin',
      header: 'Admin',
      cell: (l) => (
        <div>
          <div className="text-[12px] text-slate-900 dark:text-slate-100">
            {l.admin.name || l.admin.email}
          </div>
          {l.admin.name && <div className="text-[11px] text-slate-500">{l.admin.email}</div>}
        </div>
      )
    },
    {
      key: 'action',
      header: 'Action',
      cell: (l) => <span className="font-mono text-[12px] text-slate-800 dark:text-slate-200">{l.action}</span>
    },
    {
      key: 'target',
      header: 'Target',
      cell: (l) => (
        <div>
          <div className="text-[12px] text-slate-700 dark:text-slate-200">{l.targetType}</div>
          {l.targetId && (
            <Link
              href={targetHref(l.targetType, l.targetId)}
              className="font-mono text-[11px] text-blue-600 hover:underline dark:text-blue-400"
              title={l.targetId}
            >
              {l.targetId.slice(0, 14)}
            </Link>
          )}
        </div>
      )
    },
    {
      key: 'metadata',
      header: 'Metadata',
      cell: (l) => <MetadataCell value={l.metadata as any} />
    }
  ];

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle={`${total} entries${pages > 1 ? ` · page ${page} of ${pages}` : ''}`}
      />

      <FilterBar
        resetHref={activeFilters.length > 0 ? '/admin-dashboard/audit' : undefined}
        activeFilters={activeFilters}
      >
        <FilterField label="Admin">
          <select name="adminId" defaultValue={adminId} className="input-sm">
            <option value="">All admins</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name ? `${a.name} · ${a.email}` : a.email}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Target">
          <select name="targetType" defaultValue={targetType} className="input-sm">
            <option value="">All target types</option>
            {distinctTypes.map((t) => (
              <option key={t.targetType} value={t.targetType}>
                {t.targetType}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Action contains" className="min-w-[12rem]">
          <input name="action" defaultValue={actionFilter} placeholder="e.g. refund" className="input-sm" />
        </FilterField>
        <FilterField label="From">
          <input type="date" name="from" defaultValue={fromStr} className="input-sm" />
        </FilterField>
        <FilterField label="To">
          <input type="date" name="to" defaultValue={toStr} className="input-sm" />
        </FilterField>
      </FilterBar>

      <DataTable columns={columns} rows={logs} rowKey={(l) => l.id} empty="No entries match these filters." />

      <Pager page={page} pages={pages} buildHref={buildHref} />
    </div>
  );
}

function targetHref(targetType: string, targetId: string): string {
  switch (targetType) {
    case 'Order':
      return `/admin-dashboard/orders/${targetId}`;
    case 'Exam':
      return `/admin-dashboard/exams/${targetId}`;
    case 'User':
      return `/admin-dashboard/users/${targetId}`;
    default:
      return `#`;
  }
}

function MetadataCell({ value }: { value: unknown }) {
  if (value === null || value === undefined) return <span className="text-slate-400">—</span>;
  const json = JSON.stringify(value);
  const short = json.length > 60 ? `${json.slice(0, 57)}…` : json;
  return (
    <code
      title={json}
      className="block max-w-[24rem] truncate font-mono text-xs text-slate-600 dark:text-slate-400"
    >
      {short}
    </code>
  );
}
