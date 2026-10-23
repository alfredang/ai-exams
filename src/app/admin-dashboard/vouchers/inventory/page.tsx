import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Prisma, VoucherInventoryStatus } from '@prisma/client';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar, FilterField } from '@/components/admin/filter-bar';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Pager } from '@/components/admin/pager';
import { Badge, StatusBadge } from '@/components/admin/badge';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { buildQS } from '@/components/admin/qs';
import { parseCsvVouchers } from '@/lib/voucher-inventory';
import { Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

type SearchParams = Promise<{
  q?: string;
  status?: string;
  vendorId?: string;
  examId?: string;
  page?: string;
}>;

type RowType = Awaited<ReturnType<typeof loadRows>>[number];

async function loadRows(where: Prisma.VoucherInventoryWhereInput, skip: number, take: number) {
  return db.voucherInventory.findMany({
    where,
    include: {
      vendor: { select: { name: true } },
      exam: { select: { code: true } },
      importedBy: { select: { email: true, name: true } },
      assignedEntitlement: {
        select: {
          user: { select: { email: true } },
          exam: { select: { code: true } }
        }
      }
    },
    orderBy: [{ status: 'asc' }, { importedAt: 'desc' }],
    skip,
    take
  });
}

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') throw new Error('forbidden');
  return user as { id: string };
}

async function uploadInventory(formData: FormData) {
  'use server';
  const me = await requireAdmin();
  const vendorId = String(formData.get('vendorId') || '');
  const examId = String(formData.get('examId') || '') || null;
  if (!vendorId) return;
  const file = formData.get('file');
  let body = '';
  if (file instanceof File) {
    body = await file.text();
  } else {
    body = String(formData.get('codes') || '');
  }
  const rows = parseCsvVouchers(body);
  if (rows.length === 0) return;
  // Bulk insert; skip duplicates via createMany.
  const data = rows.map((r) => ({
    vendorId,
    examId,
    code: r.code,
    expiresAt: r.expiresAt,
    importedById: me.id
  }));
  let created = 0;
  try {
    const r = await db.voucherInventory.createMany({ data, skipDuplicates: true });
    created = r.count;
  } catch {
    // Fall through; createMany failure surfaces in count.
  }
  await db.adminLog.create({
    data: {
      adminId: me.id,
      action: 'voucher.inventory.upload',
      targetType: 'Vendor',
      targetId: vendorId,
      metadata: { examId, attempted: rows.length, created }
    }
  });
  revalidatePath('/admin-dashboard/vouchers/inventory');
}

async function deleteCode(formData: FormData) {
  'use server';
  const me = await requireAdmin();
  const id = String(formData.get('id'));
  const row = await db.voucherInventory.findUnique({ where: { id } });
  if (!row || row.status !== 'AVAILABLE') return;
  await db.voucherInventory.delete({ where: { id } });
  await db.adminLog.create({
    data: { adminId: me.id, action: 'voucher.inventory.delete', targetType: 'Vendor', targetId: row.vendorId, metadata: { code: row.code } }
  });
  revalidatePath('/admin-dashboard/vouchers/inventory');
}

export default async function VoucherInventoryPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q || '').trim();
  const status = (sp.status as VoucherInventoryStatus | undefined) ?? undefined;
  const vendorId = sp.vendorId || '';
  const examId = sp.examId || '';
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.VoucherInventoryWhereInput = {};
  if (q) where.code = { contains: q, mode: 'insensitive' };
  if (status && ['AVAILABLE', 'RESERVED', 'ASSIGNED', 'EXPIRED'].includes(status)) where.status = status;
  if (vendorId) where.vendorId = vendorId;
  if (examId) where.examId = examId;

  const [total, rows, vendors, exams, agg] = await Promise.all([
    db.voucherInventory.count({ where }),
    loadRows(where, (page - 1) * PAGE_SIZE, PAGE_SIZE),
    db.vendor.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    db.exam.findMany({
      where: { deletedAt: null, ...(vendorId ? { vendorId } : {}) },
      orderBy: [{ vendor: { name: 'asc' } }, { code: 'asc' }],
      select: { id: true, code: true, vendor: { select: { name: true } } }
    }),
    db.voucherInventory.groupBy({ by: ['status'], _count: { _all: true } })
  ]);

  const counts = Object.fromEntries(agg.map((a) => [a.status, a._count._all]));
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const baseParams = { q, status, vendorId, examId };
  const buildHref = (p: number) =>
    `/admin-dashboard/vouchers/inventory${buildQS({ ...baseParams, page: p === 1 ? undefined : p })}`;

  const activeFilters = [
    q && { key: 'search', label: q, clearHref: `/admin-dashboard/vouchers/inventory${buildQS({ ...baseParams, q: undefined })}` },
    status && { key: 'status', label: status, clearHref: `/admin-dashboard/vouchers/inventory${buildQS({ ...baseParams, status: undefined })}` },
    vendorId && { key: 'vendor', label: vendors.find((v) => v.id === vendorId)?.name ?? vendorId, clearHref: `/admin-dashboard/vouchers/inventory${buildQS({ ...baseParams, vendorId: undefined, examId: undefined })}` },
    examId && { key: 'exam', label: exams.find((e) => e.id === examId)?.code ?? examId, clearHref: `/admin-dashboard/vouchers/inventory${buildQS({ ...baseParams, examId: undefined })}` }
  ].filter(Boolean) as { key: string; label: string; clearHref: string }[];

  const columns: Column<RowType>[] = [
    {
      key: 'code',
      header: 'Code',
      cell: (r) => <span className="font-mono text-[12px] font-semibold">{r.code}</span>
    },
    { key: 'vendor', header: 'Vendor', cell: (r) => r.vendor.name },
    { key: 'exam', header: 'Exam', cell: (r) => r.exam?.code ?? <span className="text-slate-400">any</span> },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => <StatusBadge status={r.status} />
    },
    {
      key: 'expires',
      header: 'Expires',
      cell: (r) =>
        r.expiresAt ? (
          <span className={`text-xs ${r.expiresAt < new Date() ? 'text-red-600' : 'text-slate-600 dark:text-slate-300'}`}>
            {r.expiresAt.toISOString().slice(0, 10)}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        )
    },
    {
      key: 'assignment',
      header: 'Assigned to',
      cell: (r) =>
        r.assignedEntitlement ? (
          <span className="text-xs">{r.assignedEntitlement.user.email}</span>
        ) : (
          <span className="text-slate-400">—</span>
        )
    },
    {
      key: 'imported',
      header: 'Imported',
      cell: (r) => (
        <div className="text-xs text-slate-500">
          <div>{r.importedAt.toISOString().slice(0, 10)}</div>
          <div>{r.importedBy.email}</div>
        </div>
      )
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      headerClassName: 'w-12',
      cell: (r) => (
        r.status === 'AVAILABLE' ? (
          <form action={deleteCode} className="inline-flex">
            <input type="hidden" name="id" value={r.id} />
            <ConfirmButton message={`Delete unassigned code ${r.code}?`} className="h-6 w-6 p-0">
              <Trash2 className="h-3 w-3" />
            </ConfirmButton>
          </form>
        ) : null
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Voucher inventory"
        subtitle={`${total} code${total === 1 ? '' : 's'}${pages > 1 ? ` · page ${page} of ${pages}` : ''}`}
        actions={
          <Link href="/admin-dashboard/vouchers" className="btn-sm bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">
            Deliveries →
          </Link>
        }
      />

      {/* Status counters */}
      <div className="mb-3 flex flex-wrap gap-2">
        <Counter label="Available" value={counts.AVAILABLE ?? 0} variant="success" />
        <Counter label="Assigned" value={counts.ASSIGNED ?? 0} variant="muted" />
        <Counter label="Reserved" value={counts.RESERVED ?? 0} variant="info" />
        <Counter label="Expired" value={counts.EXPIRED ?? 0} variant="danger" />
      </div>

      {/* Upload form */}
      <details className="card mb-3 p-4">
        <summary className="cursor-pointer text-[13px] font-semibold">Upload codes (CSV or one per line)</summary>
        <form action={uploadInventory} className="mt-3 grid gap-3 md:grid-cols-2" encType="multipart/form-data">
          <label className="block md:col-span-1">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">Vendor</span>
            <select name="vendorId" required className="input-sm" defaultValue="">
              <option value="">Select a vendor…</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-1">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">Exam (optional — leave blank for vendor-wide)</span>
            <select name="examId" className="input-sm" defaultValue="">
              <option value="">All exams (vendor-wide)</option>
              {exams.map((e) => (<option key={e.id} value={e.id}>{e.vendor.name} · {e.code}</option>))}
            </select>
          </label>
          <label className="block md:col-span-1">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">CSV file</span>
            <input type="file" name="file" accept=".csv,text/csv,text/plain" className="block w-full text-[12px]" />
            <span className="mt-1 block text-[11px] text-slate-500">Columns: <code>code</code> (required), <code>expiresAt</code> (optional, ISO date). First row may be a header.</span>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">…or paste codes (one per line)</span>
            <textarea name="codes" rows={4} placeholder="VCH-ABC123&#10;VCH-DEF456" className="w-full rounded-md border border-slate-200 bg-white p-2 text-[12px] font-mono outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          </label>
          <div className="md:col-span-2">
            <button className="inline-flex h-8 items-center rounded-md bg-blue-600 px-3 text-[12px] font-medium text-white hover:bg-blue-700">
              Upload
            </button>
          </div>
        </form>
      </details>

      <FilterBar resetHref={activeFilters.length > 0 ? '/admin-dashboard/vouchers/inventory' : undefined} activeFilters={activeFilters}>
        <FilterField label="Search code" className="min-w-[12rem]">
          <input name="q" defaultValue={q} placeholder="VCH-…" className="input-sm" />
        </FilterField>
        <FilterField label="Status">
          <select name="status" defaultValue={status ?? ''} className="input-sm">
            <option value="">All</option>
            <option>AVAILABLE</option>
            <option>RESERVED</option>
            <option>ASSIGNED</option>
            <option>EXPIRED</option>
          </select>
        </FilterField>
        <FilterField label="Vendor">
          <select name="vendorId" defaultValue={vendorId} className="input-sm">
            <option value="">All vendors</option>
            {vendors.map((v) => (<option key={v.id} value={v.id}>{v.name}</option>))}
          </select>
        </FilterField>
        <FilterField label="Exam">
          <select name="examId" defaultValue={examId} className="input-sm">
            <option value="">All exams</option>
            {exams.map((e) => (<option key={e.id} value={e.id}>{e.vendor.name} · {e.code}</option>))}
          </select>
        </FilterField>
      </FilterBar>

      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} empty="No inventory yet. Upload some codes above." />

      <Pager page={page} pages={pages} buildHref={buildHref} />
    </div>
  );
}

function Counter({ label, value, variant }: { label: string; value: number; variant: 'success' | 'warn' | 'danger' | 'muted' | 'info' }) {
  return (
    <div className="card flex items-center gap-2 px-3 py-1.5">
      <Badge variant={variant}>{label}</Badge>
      <span className="font-mono text-[13px] font-semibold">{value}</span>
    </div>
  );
}
