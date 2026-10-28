import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { Pencil } from 'lucide-react';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar, FilterField } from '@/components/admin/filter-bar';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Pager } from '@/components/admin/pager';
import { buildQS } from '@/components/admin/qs';
import { examBaseTitle } from '@/lib/exam-title';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ q?: string; vendor?: string; seo?: string; page?: string }>;
const PAGE_SIZE = 50;

// Every certification (pool question bank) with its exam details and SEO
// status. Retired variants are left out: their settings no longer apply.
export default async function AdminCertificationsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = (sp.q || '').trim();
  const vendorFilter = sp.vendor || '';
  const seoMissing = sp.seo === 'missing';

  const where: Prisma.ExamWhereInput = { deletedAt: null, poolExamId: null };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { code: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } }
    ];
  }
  if (vendorFilter) where.vendor = { slug: vendorFilter };
  if (seoMissing) where.AND = [{ OR: [{ metaTitle: null }, { metaDescription: null }, { metaKeywords: null }] }];

  const total = await db.exam.count({ where });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number(sp.page) || 1));
  const [vendors, rows] = await Promise.all([
    db.vendor.findMany({ orderBy: { name: 'asc' }, select: { id: true, slug: true, name: true } }),
    db.exam.findMany({
      where,
      orderBy: [{ vendor: { name: 'asc' } }, { title: 'asc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, title: true, code: true, level: true, durationMinutes: true, passingScore: true, questionCount: true,
        domains: true, metaTitle: true, metaDescription: true, metaKeywords: true,
        vendor: { select: { name: true } },
        bundleItems: { where: { tier: 'PRACTICE' }, select: { bundle: { select: { id: true, published: true } } } }
      }
    })
  ]);
  type Row = (typeof rows)[number];
  const base = { q, vendor: vendorFilter, seo: seoMissing ? 'missing' : undefined };

  const columns: Column<Row>[] = [
    {
      key: 'title',
      header: 'Certification',
      cell: (e) => (
        <Link href={`/admin-dashboard/certifications/${e.id}`} className="block max-w-[22rem] truncate font-medium text-slate-900 hover:underline dark:text-slate-100" title={e.title}>
          {examBaseTitle(e.title)}
        </Link>
      )
    },
    { key: 'code', header: 'Code', cell: (e) => <span className="font-mono text-xs">{e.code}</span> },
    { key: 'vendor', header: 'Vendor', hideBelow: '2xl', cell: (e) => e.vendor.name },
    { key: 'level', header: 'Level', hideBelow: '2xl', cell: (e) => e.level },
    { key: 'qpe', header: 'Q / Exam', align: 'right', cell: (e) => e.questionCount },
    { key: 'duration', header: 'Duration', align: 'right', cell: (e) => <span className="whitespace-nowrap">{e.durationMinutes} min</span> },
    { key: 'pass', header: 'Pass', align: 'right', cell: (e) => `${e.passingScore}%` },
    {
      key: 'domains',
      header: 'Domains',
      align: 'right',
      cell: (e) => (Array.isArray(e.domains) && e.domains.length > 0 ? (
        <Link href={`/admin-dashboard/certifications/${e.id}#domains`} className="hover:underline">{e.domains.length}</Link>
      ) : <span className="text-slate-400">—</span>)
    },
    {
      key: 'seo',
      header: 'SEO',
      cell: (e) => {
        const ok = e.metaTitle && e.metaDescription && e.metaKeywords;
        return (
          <Link href={`/admin-dashboard/certifications/${e.id}#seo`} className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] hover:underline">
            <span className={`h-2 w-2 rounded-full ${ok ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {ok ? 'Complete' : 'Missing'}
          </Link>
        );
      }
    },
    {
      key: 'product',
      header: 'Practice Exam',
      hideBelow: '2xl',
      cell: (e) => {
        const b = e.bundleItems.find((i) => i.bundle.published)?.bundle ?? e.bundleItems[0]?.bundle;
        return b ? (
          <Link href={`/admin-dashboard/bundles/${b.id}`} className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] text-blue-700 hover:underline dark:text-blue-300">
            <span className={`h-2 w-2 rounded-full ${b.published ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {b.published ? 'On sale' : 'Off sale'}
          </Link>
        ) : <span className="text-[12px] text-slate-400">None</span>;
      }
    },
    {
      key: 'actions', sticky: true, header: '', align: 'right', headerClassName: 'w-16',
      cell: (e) => (
        <Link href={`/admin-dashboard/certifications/${e.id}`} title="Edit certification" className="icon-btn">
          <Pencil className="h-3.5 w-3.5" />
        </Link>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Certifications"
        subtitle={`${total} certifications — exam title, code, duration, pass mark, questions per exam, exam domains and SEO for each. Questions are managed in Question Banks.`}
      />

      <FilterBar resetHref={q || vendorFilter || seoMissing ? '/admin-dashboard/certifications' : undefined}>
        <FilterField label="Vendor">
          <select name="vendor" defaultValue={vendorFilter} className="input-sm">
            <option value="">All vendors</option>
            {vendors.map((v) => <option key={v.id} value={v.slug}>{v.name}</option>)}
          </select>
        </FilterField>
        <FilterField label="SEO">
          <select name="seo" defaultValue={seoMissing ? 'missing' : ''} className="input-sm">
            <option value="">Any</option>
            <option value="missing">Missing SEO</option>
          </select>
        </FilterField>
        <FilterField label="Search" className="min-w-[14rem] flex-1">
          <input name="q" defaultValue={q} placeholder="Title, code or slug…" className="input-sm" />
        </FilterField>
      </FilterBar>

      <DataTable columns={columns} rows={rows} rowKey={(e) => e.id} empty="No certifications match." />
      <Pager page={page} pages={pages} buildHref={(p) => `/admin-dashboard/certifications${buildQS({ ...base, page: p > 1 ? String(p) : undefined })}`} />
    </div>
  );
}
