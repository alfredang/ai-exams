import Link from 'next/link';
import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import { Pencil } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar, FilterField } from '@/components/admin/filter-bar';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Pager } from '@/components/admin/pager';
import { Badge } from '@/components/admin/badge';
import { buildQS } from '@/components/admin/qs';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

type SearchParams = Promise<{ q?: string; status?: string; scope?: string; page?: string }>;

type CouponRow = Awaited<ReturnType<typeof loadCoupons>>[number];

async function loadCoupons(where: Prisma.CouponWhereInput, skip: number, take: number) {
  return db.coupon.findMany({
    where,
    include: {
      scopeExam: { select: { code: true } },
      scopeVendor: { select: { name: true } },
      _count: { select: { redemptions: true } }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take
  });
}

export default async function AdminCouponsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = (sp.q || '').trim();
  const status = sp.status || '';
  const scope = sp.scope || '';
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.CouponWhereInput = {};
  if (q) where.code = { contains: q, mode: 'insensitive' };
  if (status === 'enabled') where.enabled = true;
  if (status === 'disabled') where.enabled = false;
  if (status === 'expired') where.endsAt = { lt: new Date() };
  if (scope === 'GLOBAL' || scope === 'EXAM' || scope === 'VENDOR') where.scope = scope as any;

  const [total, rows] = await Promise.all([
    db.coupon.count({ where }),
    loadCoupons(where, (page - 1) * PAGE_SIZE, PAGE_SIZE)
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const baseParams = { q, status, scope };
  const buildHref = (p: number) =>
    `/admin-dashboard/coupons${buildQS({ ...baseParams, page: p === 1 ? undefined : p })}`;

  const activeFilters = [
    q && { key: 'search', label: q, clearHref: `/admin-dashboard/coupons${buildQS({ ...baseParams, q: undefined })}` },
    status && { key: 'status', label: status, clearHref: `/admin-dashboard/coupons${buildQS({ ...baseParams, status: undefined })}` },
    scope && { key: 'scope', label: scope, clearHref: `/admin-dashboard/coupons${buildQS({ ...baseParams, scope: undefined })}` }
  ].filter(Boolean) as { key: string; label: string; clearHref: string }[];

  const now = new Date();
  const columns: Column<CouponRow>[] = [
    {
      key: 'code',
      header: 'Code',
      cell: (c) => (
        <Link href={`/admin-dashboard/coupons/${c.id}`} className="font-mono text-[12px] font-semibold text-slate-900 hover:underline dark:text-slate-100">
          {c.code}
        </Link>
      )
    },
    {
      key: 'value',
      header: 'Discount',
      cell: (c) => (
        <span className="font-medium">
          {c.kind === 'PERCENT' ? `${c.value}%` : `$${(c.value / 100).toFixed(2)}`}
        </span>
      )
    },
    {
      key: 'scope',
      header: 'Scope',
      cell: (c) => (
        <div>
          <Badge variant="muted">{c.scope}</Badge>
          {c.scopeExam && <span className="ml-1 text-xs text-slate-500">{c.scopeExam.code}</span>}
          {c.scopeVendor && <span className="ml-1 text-xs text-slate-500">{c.scopeVendor.name}</span>}
        </div>
      )
    },
    {
      key: 'window',
      header: 'Window',
      cell: (c) => (
        <span className="text-xs text-slate-500">
          {c.startsAt ? c.startsAt.toISOString().slice(0, 10) : '—'} → {c.endsAt ? c.endsAt.toISOString().slice(0, 10) : '∞'}
        </span>
      )
    },
    {
      key: 'uses',
      header: 'Uses',
      align: 'right',
      cell: (c) => (
        <span className="font-medium">
          {c._count.redemptions}{c.maxRedemptions != null ? ` / ${c.maxRedemptions}` : ''}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      cell: (c) => {
        if (!c.enabled) return <Badge variant="muted">Disabled</Badge>;
        if (c.endsAt && c.endsAt < now) return <Badge variant="warn">Expired</Badge>;
        if (c.startsAt && c.startsAt > now) return <Badge variant="info">Scheduled</Badge>;
        if (c.maxRedemptions != null && c._count.redemptions >= c.maxRedemptions) return <Badge variant="warn">Maxed</Badge>;
        return <Badge variant="success">Active</Badge>;
      }
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      headerClassName: 'w-16',
      cell: (c) => (
        <Link href={`/admin-dashboard/coupons/${c.id}`} title="Edit" className="icon-btn">
          <Pencil className="h-3.5 w-3.5" />
        </Link>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Coupons"
        subtitle={`${total} coupon${total === 1 ? '' : 's'}${pages > 1 ? ` · page ${page} of ${pages}` : ''}`}
        actions={
          <Link href="/admin-dashboard/coupons/new" className="btn-sm bg-blue-600 text-white hover:bg-blue-700">
            + Create Coupon
          </Link>
        }
      />

      <FilterBar resetHref={activeFilters.length > 0 ? '/admin-dashboard/coupons' : undefined} activeFilters={activeFilters}>
        <FilterField label="Search code" className="min-w-[12rem]">
          <input name="q" defaultValue={q} placeholder="e.g. SAVE10" className="input-sm" />
        </FilterField>
        <FilterField label="Status">
          <select name="status" defaultValue={status} className="input-sm">
            <option value="">All</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
            <option value="expired">Expired</option>
          </select>
        </FilterField>
        <FilterField label="Scope">
          <select name="scope" defaultValue={scope} className="input-sm">
            <option value="">All scopes</option>
            <option>GLOBAL</option>
            <option>EXAM</option>
            <option>VENDOR</option>
          </select>
        </FilterField>
      </FilterBar>

      <DataTable columns={columns} rows={rows} rowKey={(c) => c.id} empty="No coupons yet. Click + Create Coupon to add one." />

      <Pager page={page} pages={pages} buildHref={buildHref} />
    </div>
  );
}
