import Link from 'next/link';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { practiceExamCount, practiceExamLabel, practiceQuestionTotal } from '@/lib/bundle-contents';
import { CatalogFilters } from './filters';
import { matchesCatalogSearch } from '@/lib/catalog-search';

const PAGE_SIZE = 9;

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ q?: string; level?: string; vendor?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q || '').trim();
  const where = {
    published: true,
    deletedAt: null,
    // Hide exams that don't have any published questions yet — they're
    // catalog placeholders waiting on content. Admins still see them
    // in /admin-dashboard (which doesn't apply this filter).
    questions: { some: { status: 'PUBLISHED' as const } },
    ...(sp.vendor ? { vendor: { slug: sp.vendor } } : {}),
    ...(sp.level ? { level: sp.level } : {}),
    ...(q ? { OR: [
      { title: { contains: q, mode: 'insensitive' as const } },
      { code: { contains: q, mode: 'insensitive' as const } }
    ] } : {})
  };
  // Bundle-only catalog (per project policy): individual exam cards are
  // hidden — customers only purchase bundles. The `where` filter is still
  // used by the bundle query indirectly when we filter by vendor/level.
  void where;

  const allBundlesRaw = await db.bundle.findMany({
    where: { published: true },
    include: { items: { include: { exam: { include: { vendor: true } } } } },
    orderBy: { createdAt: 'desc' }
  });
  // Filter bundles in memory for vendor/level (they're derived from item[0]).
  const allBundles = allBundlesRaw.filter(b => {
    const first = b.items[0]?.exam;
    if (sp.vendor && first?.vendor.slug !== sp.vendor) return false;
    if (sp.level && first?.level !== sp.level) return false;
    if (q && !matchesCatalogSearch(q, [
      b.title,
      b.description,
      ...b.items.flatMap((item) => [
        item.exam.vendor.name,
        item.exam.vendor.slug,
        item.exam.code,
        item.exam.title,
        item.exam.level,
        item.exam.description
      ])
    ])) return false;
    return true;
  });

  // Bundle-only catalog: no standalone exam cards.
  type Card = { kind: 'bundle'; data: (typeof allBundles)[number] };
  const allCards: Card[] = allBundles.map(b => ({ kind: 'bundle' as const, data: b }));
  const totalCount = allCards.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const requestedPage = Number(sp.page) || 1;
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const pageCards = allCards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const vendors = await db.vendor.findMany({ orderBy: { name: 'asc' } });
  const levels = ['Foundational', 'Associate', 'Professional', 'Specialty'];

  return (
    <div className="container-app py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Practice exams</h1>
        <p className="mt-1 text-slate-600">Browse certifications across leading vendors. Try our free practice teaser on every exam.</p>
      </div>

      <CatalogFilters
        q={q}
        vendor={sp.vendor || ''}
        level={sp.level || ''}
        vendors={vendors.map(v => ({ id: v.id, slug: v.slug, name: v.name }))}
        levels={levels}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pageCards.map(card => {
          const b = card.data;
          const firstItem = b.items[0]?.exam;
          // PRACTICE items only — the VOUCHER item points back at the same -p1
          // exam, so counting raw items double-counts it. See bundle-contents.ts.
          const totalQuestions = practiceQuestionTotal(b.items);
          const examCount = practiceExamCount(b.items);
          return (
            <Link key={`b-${b.id}`} href={firstItem ? `/practice-exams/${firstItem.vendor.slug}/${b.slug}` : `/bundles/${b.slug}`} className="card-hover p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                {firstItem && <span className="badge">{firstItem.vendor.name}</span>}
                {firstItem && <span className="badge">{firstItem.code}</span>}
                {firstItem && <span className="badge">{firstItem.level}</span>}
              </div>
              <h3 className="font-semibold">{b.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{b.description}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{totalQuestions} questions · {practiceExamLabel(examCount)}</span>
                <span className="font-semibold text-blue-700 dark:text-blue-300">{b.price === 0 ? 'Free' : `from ${formatPrice(b.price)}`}</span>
              </div>
            </Link>
          );
        })}
        {totalCount === 0 && <p className="text-slate-500">No bundles found.</p>}
      </div>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          searchParams={{ q, vendor: sp.vendor, level: sp.level }}
        />
      )}
    </div>
  );
}

function Pagination({ page, totalPages, totalCount, searchParams }: {
  page: number;
  totalPages: number;
  totalCount: number;
  searchParams: { q?: string; vendor?: string; level?: string };
}) {
  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (searchParams.q) params.set('q', searchParams.q);
    if (searchParams.vendor) params.set('vendor', searchParams.vendor);
    if (searchParams.level) params.set('level', searchParams.level);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `/practice-exams?${qs}` : '/practice-exams';
  };

  // Build a compact page list with ellipses around the current page
  const pages: (number | 'gap')[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== 'gap') {
      pages.push('gap');
    }
  }

  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(totalCount, page * PAGE_SIZE);

  return (
    <nav className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between" aria-label="Pagination">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing {start}–{end} of {totalCount} exam{totalCount === 1 ? '' : 's'}
      </p>
      <div className="flex items-center gap-1">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">Previous</Link>
        ) : (
          <span className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-400 dark:border-slate-800 dark:text-slate-600">Previous</span>
        )}
        {pages.map((p, i) =>
          p === 'gap'
            ? <span key={`gap-${i}`} className="px-2 text-slate-400">…</span>
            : p === page
              ? <span key={p} aria-current="page" className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white">{p}</span>
              : <Link key={p} href={hrefFor(p)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">{p}</Link>
        )}
        {page < totalPages ? (
          <Link href={hrefFor(page + 1)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">Next</Link>
        ) : (
          <span className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-400 dark:border-slate-800 dark:text-slate-600">Next</span>
        )}
      </div>
    </nav>
  );
}
