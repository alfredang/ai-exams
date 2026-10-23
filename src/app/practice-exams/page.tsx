import Link from 'next/link';
import { BarChart3, Library, RefreshCw, Timer } from 'lucide-react';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { PUBLISHED_QUESTION_COUNT } from '@/lib/bundle-contents';
import { PRACTICE_PRICE_CENTS } from '@/lib/products';
import { ProductCard } from '@/components/storefront/product-card';
import { VoucherUpsellBanner } from '@/components/storefront/voucher-upsell-banner';
import { CatalogFilters } from './filters';
import { FeatureCards, type Feature } from '@/components/feature-cards';
import { bundleSearchAliases, catalogSearchRank, catalogSearchSuggestions, matchesCatalogSearch } from '@/lib/catalog-search';

const PAGE_SIZE = 9;

const FEATURES: Feature[] = [
  { icon: Timer, t: 'Realistic exam mode', d: 'Timed, full-length exams in a test-centre screen that mirrors the real thing.' },
  { icon: RefreshCw, t: 'Unlimited retakes', d: 'Every attempt is a fresh draw from the pool — retake as often as you like.' },
  { icon: BarChart3, t: 'Performance review', d: 'Per-domain scores, answer review with explanations, and your score trend over time.' },
  { icon: Library, t: 'Large question pool', d: 'Questions weighted to the official exam domains, so practice matches the blueprint.' }
];

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
    include: { items: { include: { exam: { include: { vendor: true, ...PUBLISHED_QUESTION_COUNT } } } } },
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
      ...bundleSearchAliases(b.slug),
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
  if (q) {
    // Title/code matches first; Array.prototype.sort is stable, so ties keep
    // the newest-first order from the query.
    const rank = new Map(allBundles.map((b) => [b.id, catalogSearchRank(q, [
      b.title,
      ...bundleSearchAliases(b.slug),
      ...b.items.flatMap((item) => [item.exam.code, item.exam.title])
    ])]));
    allBundles.sort((a, b) => rank.get(b.id)! - rank.get(a.id)!);
  }
  const suggestions = q && allBundles.length === 0
    ? catalogSearchSuggestions(q, allBundlesRaw.flatMap((bundle) => [
        bundle.title,
        ...bundleSearchAliases(bundle.slug),
        ...bundle.items.flatMap((item) => [item.exam.vendor.name, item.exam.code, item.exam.title])
      ]))
    : [];

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
      <div className="mb-8 max-w-3xl">
        <p className="eyebrow mb-2">Practice Exams</p>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Practice Exams for leading Certifications</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Every Practice Exam is <b className="text-ink dark:text-white">{formatPrice(PRACTICE_PRICE_CENTS)}</b> — timed Exam mode, Practice mode with explanations and unlimited retakes. Start with the free 10-question teaser on any Practice Exam.
        </p>
      </div>

      <FeatureCards items={FEATURES} />

      <VoucherUpsellBanner className="mb-8" />

      <CatalogFilters
        q={q}
        vendor={sp.vendor || ''}
        level={sp.level || ''}
        vendors={vendors.map(v => ({ id: v.id, slug: v.slug, name: v.name }))}
        levels={levels}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pageCards.map(card => {
          const b = card.data;
          return (
            <div key={`b-${b.id}`} className="flex flex-col">
              <ProductCard b={b} query={q} />
              {q && bundleSearchAliases(b.slug).filter(alias => matchesCatalogSearch(q, [alias])).map(alias => (
                <p key={alias} className="mt-1 px-1 text-xs font-medium text-blue-700 dark:text-blue-300">Matched course code: <mark className="rounded bg-yellow-200 px-1 text-slate-950">{alias}</mark></p>
              ))}
            </div>
          );
        })}
        {totalCount === 0 && (
          <div className="rounded-lg border border-line bg-white p-5 text-sm sm:col-span-2 lg:col-span-3 dark:border-slate-800 dark:bg-slate-900/80">
            <p className="font-medium">No Practice Exams found.</p>
            <p className="mt-1 text-slate-500 dark:text-slate-400">Try an exam name, Certification code, Vendor, or verified TGS/course code. Some training courses do not yet have a Practice Exam in this database.</p>
            {suggestions.length > 0 && (
              <p className="mt-3">Did you mean?{' '}{suggestions.map((suggestion, index) => (
                <span key={suggestion}>{index > 0 && ', '}<Link className="text-blue-700 hover:underline dark:text-blue-300" href={`/practice-exams?q=${encodeURIComponent(suggestion)}`}>{suggestion}</Link></span>
              ))}</p>
            )}
          </div>
        )}
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
      <div className="flex flex-wrap items-center justify-center gap-1">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-md border border-line bg-white px-3 py-1.5 text-sm dark:bg-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">Previous</Link>
        ) : (
          <span className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-md border border-line bg-white px-3 py-1.5 text-sm dark:bg-slate-900 text-slate-400 dark:border-slate-800 dark:text-slate-600">Previous</span>
        )}
        {pages.map((p, i) =>
          p === 'gap'
            ? <span key={`gap-${i}`} className="px-2 text-slate-400">…</span>
            : p === page
              ? <span key={p} aria-current="page" className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white">{p}</span>
              : <Link key={p} href={hrefFor(p)} className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-md border border-line bg-white px-3 py-1.5 text-sm dark:bg-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">{p}</Link>
        )}
        {page < totalPages ? (
          <Link href={hrefFor(page + 1)} className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-md border border-line bg-white px-3 py-1.5 text-sm dark:bg-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">Next</Link>
        ) : (
          <span className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-md border border-line bg-white px-3 py-1.5 text-sm dark:bg-slate-900 text-slate-400 dark:border-slate-800 dark:text-slate-600">Next</span>
        )}
      </div>
    </nav>
  );
}
