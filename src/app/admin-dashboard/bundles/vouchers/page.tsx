import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { Eye, Pencil } from 'lucide-react';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar, FilterField } from '@/components/admin/filter-bar';
import { DataTable, type Column } from '@/components/admin/data-table';
import { buildQS } from '@/components/admin/qs';
import { formatMoney } from '@/lib/utils';
import { displayExamCode, voucherHref, voucherOnSale, voucherSlugFor, voucherTitleFor } from '@/lib/products';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ q?: string; vendor?: string; view?: string }>;
type View = 'priced' | 'on' | 'off' | 'none';

// The Exam Voucher products. Each one lives on its Practice Exam's row, so
// the practice exam it includes is always linked — nothing to wire up here.
export default async function AdminExamVouchersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = (sp.q || '').trim();
  const vendorFilter = sp.vendor || '';
  const view: View = sp.view === 'on' || sp.view === 'off' || sp.view === 'none' ? sp.view : 'priced';

  const filterWhere: Prisma.BundleWhereInput = {};
  if (q) {
    filterWhere.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { voucherTitle: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
      { voucherSlug: { contains: q, mode: 'insensitive' } }
    ];
  }
  if (vendorFilter) filterWhere.items = { some: { exam: { vendor: { slug: vendorFilter } } } };

  const viewWhere: Record<View, Prisma.BundleWhereInput> = {
    priced: { priceVoucher: { not: null } },
    on: { priceVoucher: { not: null }, voucherPublished: true },
    off: { priceVoucher: { not: null }, voucherPublished: false },
    none: { priceVoucher: null }
  };

  const [vendors, rows, counts] = await Promise.all([
    db.vendor.findMany({ orderBy: { name: 'asc' }, select: { id: true, slug: true, name: true } }),
    db.bundle.findMany({
      where: { ...filterWhere, ...viewWhere[view] },
      orderBy: { title: 'asc' },
      select: {
        id: true, slug: true, title: true, published: true, price: true, priceVoucher: true,
        voucherSlug: true, voucherTitle: true, voucherPublished: true, updatedAt: true,
        items: { where: { tier: 'PRACTICE' }, take: 1, select: { exam: { select: { code: true, level: true, vendor: { select: { name: true, slug: true } } } } } },
        _count: { select: { orders: { where: { tier: 'VOUCHER', status: 'PAID' } } } }
      }
    }),
    Promise.all((['on', 'off', 'none'] as const).map((v) => db.bundle.count({ where: { ...filterWhere, ...viewWhere[v] } })))
  ]);
  type Row = (typeof rows)[number];

  const base = { q, vendor: vendorFilter };
  const viewHref = (v: View) => `/admin-dashboard/bundles/vouchers${buildQS({ ...base, view: v === 'priced' ? undefined : v })}`;
  const chips: { v: View; label: string; count?: number; dot: string }[] = [
    { v: 'on', label: 'On sale', count: counts[0], dot: 'bg-emerald-500' },
    { v: 'off', label: 'Off sale', count: counts[1], dot: 'bg-slate-400' },
    { v: 'none', label: 'No voucher yet', count: counts[2], dot: 'bg-amber-500' }
  ];

  const columns: Column<Row>[] = [
    {
      key: 'title',
      header: 'Exam Voucher',
      cell: (b) => (
        <Link href={`/admin-dashboard/bundles/${b.id}/voucher`} className="block max-w-[26rem] truncate font-medium text-slate-900 hover:underline dark:text-slate-100" title={voucherTitleFor(b)}>
          {voucherTitleFor(b)}
        </Link>
      )
    },
    {
      key: 'code',
      header: 'Code',
      cell: (b) => <span className="font-mono text-xs">{displayExamCode(b.items[0]?.exam.code) || '—'}</span>
    },
    { key: 'vendor', header: 'Vendor', hideBelow: '2xl', cell: (b) => b.items[0]?.exam.vendor.name ?? '—' },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      cell: (b) => <span className="whitespace-nowrap font-semibold">{b.priceVoucher != null ? formatMoney(b.priceVoucher) : '—'}</span>
    },
    {
      key: 'status',
      header: 'Status',
      cell: (b) => (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px]">
          <span className={`h-2 w-2 rounded-full ${b.priceVoucher == null ? 'bg-amber-500' : voucherOnSale(b) ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {b.priceVoucher == null ? 'No voucher yet' : voucherOnSale(b) ? 'On sale' : 'Off sale'}
        </span>
      )
    },
    {
      key: 'includes',
      header: 'Includes Practice Exam',
      cell: (b) => (
        <Link href={`/admin-dashboard/bundles/${b.id}`} className="block max-w-[18rem] truncate text-[12px] text-blue-700 hover:underline dark:text-blue-300" title={b.title}>
          {b.title}
        </Link>
      )
    },
    { key: 'sold', header: 'Sold', align: 'right', hideBelow: '2xl', cell: (b) => b._count.orders },
    {
      key: 'actions', sticky: true, header: '', align: 'right', headerClassName: 'w-24',
      cell: (b) => (
        <div className="flex items-center justify-end gap-0.5">
          {voucherOnSale(b) && b.items[0] && (
            <Link href={voucherHref(b.items[0].exam.vendor.slug, b)} target="_blank" rel="noreferrer" title="View on site" className="icon-btn">
              <Eye className="h-3.5 w-3.5" />
            </Link>
          )}
          <Link href={`/admin-dashboard/bundles/${b.id}/voucher`} title={b.priceVoucher == null ? 'Add Exam Voucher' : 'Edit Exam Voucher'} className="icon-btn">
            <Pencil className="h-3.5 w-3.5" />
          </Link>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Exam Vouchers"
        subtitle={`${rows.length} shown — official vendor vouchers. Every Exam Voucher includes its Practice Exam free; buyers get the practice exam instantly and the code within 3–5 business days.`}
        actions={
          <Link href="/admin-dashboard/bundles" className="btn-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
            ← Practice Exams
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href={viewHref('priced')}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] ${view === 'priced' ? 'border-blue-400 bg-blue-50 text-blue-900 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-200' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}
        >
          All vouchers
        </Link>
        {chips.map((c) => (
          <Link
            key={c.v}
            href={viewHref(c.v)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] ${view === c.v ? 'border-blue-400 bg-blue-50 text-blue-900 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-200' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}
          >
            <span className={`h-2 w-2 rounded-full ${c.dot}`} />
            {c.label}
            <span className="font-semibold tabular-nums">{c.count}</span>
          </Link>
        ))}
      </div>

      <FilterBar resetHref={q || vendorFilter ? `/admin-dashboard/bundles/vouchers${buildQS({ view: view === 'priced' ? undefined : view })}` : undefined}>
        <input type="hidden" name="view" value={view === 'priced' ? '' : view} />
        <FilterField label="Vendor">
          <select name="vendor" defaultValue={vendorFilter} className="input-sm">
            <option value="">All vendors</option>
            {vendors.map((v) => <option key={v.id} value={v.slug}>{v.name}</option>)}
          </select>
        </FilterField>
        <FilterField label="Search" className="min-w-[14rem] flex-1">
          <input name="q" defaultValue={q} placeholder="Title, code or slug…" className="input-sm" />
        </FilterField>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(b) => b.id}
        empty={view === 'none' ? 'Every practice exam has an Exam Voucher.' : 'No Exam Vouchers match. Add one from a practice exam: Practice Exams → + Add voucher.'}
      />
      <p className="mt-3 text-[12px] text-slate-500">
        Voucher URLs look like <span className="font-mono">/exam-vouchers/&lt;vendor&gt;/{rows[0] ? voucherSlugFor(rows[0]) : '<slug>'}</span>.
      </p>
    </div>
  );
}
