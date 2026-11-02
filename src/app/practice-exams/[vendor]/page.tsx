import { cache } from 'react';
import Link from 'next/link';
import { Price } from '@/components/price';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { PUBLISHED_QUESTION_COUNT } from '@/lib/bundle-contents';
import { ChevronRight, Search } from 'lucide-react';
import { PRACTICE_PRICE_CENTS, displayExamCode, practiceHref } from '@/lib/products';
import { buildVendorSeo, certNames, sortForVendorSeo } from '@/lib/exam-seo';
import { serializeJsonLd } from '@/lib/structured-data';
import { vendorLandingJsonLd } from '@/lib/vendor-landing';
import { VendorSeoCopy } from '@/components/product/seo-copy';
import { ProductCard } from '@/components/storefront/product-card';
import { VoucherUpsellBanner } from '@/components/storefront/voucher-upsell-banner';
import { bundleSearchAliases, catalogSearchRank, matchesCatalogSearch } from '@/lib/catalog-search';

// ISR: vendor-page bundle listings cache for 5 min. New publishes appear
// shortly after; avoids fetching the entire bundle catalog on every visit.
export const revalidate = 300;

// Pre-render every known vendor at build time so the route is properly
// ISR-cacheable. Without this, Next falls through to fully-dynamic
// rendering for dynamic segments and ignores `revalidate` (cache-control
// becomes "private, no-cache, no-store"). New vendors added after build
// are still served via on-demand ISR thanks to dynamicParams=true (default).
export async function generateStaticParams() {
  const vendors = await db.vendor.findMany({ select: { slug: true } });
  return vendors.map(v => ({ vendor: v.slug }));
}

// Shared by generateMetadata and the page (React cache dedupes the queries).
const loadVendor = cache(async (slug: string) => {
  const [vendor, bundles] = await Promise.all([
    db.vendor.findUnique({ where: { slug } }),
    // The bundle filter is pushed to the DB via items.some so we don't load
    // the full catalog and filter in JS.
    db.bundle.findMany({
      where: {
        published: true,
        items: { some: { exam: { vendor: { slug } } } }
      },
      include: { items: { include: { exam: { include: { vendor: true, ...PUBLISHED_QUESTION_COUNT } } } } }
    })
  ]);
  if (!vendor) return null;
  // Search keys ("AZ-104", "CKA") in SEO order — most-searched first.
  const certs = sortForVendorSeo(slug, bundles.map((b) => {
    const exam = (b.items.find((i) => i.tier === 'PRACTICE') ?? b.items[0])?.exam;
    const key = certNames({ title: b.title, code: displayExamCode(exam?.code), vendor: vendor.name }).key;
    return { key, title: b.title, href: practiceHref(slug, b) };
  }), (c) => c.key);
  const seo = buildVendorSeo({ kind: 'practice', slug, name: vendor.name, keys: certs.map((c) => c.key) });
  // The sibling Exam Voucher landing page, when this Vendor sells any.
  const hasVouchers = await db.bundle.count({
    where: { priceVoucher: { not: null }, voucherPublished: true, items: { some: { tier: 'PRACTICE', exam: { vendor: { slug } } } } }
  }) > 0;
  return { vendor, bundles, certs, seo, hasVouchers };
});

export async function generateMetadata({ params }: { params: Promise<{ vendor: string }> }) {
  const { vendor: slug } = await params;
  const data = await loadVendor(slug);
  if (!data) return {};
  const { metaTitle: title, metaDescription: description, metaKeywords: keywords } = data.seo;
  return {
    title,
    description,
    keywords,
    openGraph: { title, description },
    alternates: { canonical: `/practice-exams/${slug}` }
  };
}

export default async function VendorCatalogPage({
  params,
  searchParams
}: {
  params: Promise<{ vendor: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { vendor: slug } = await params;
  const query = ((await searchParams).q || '').trim();
  const data = await loadVendor(slug);
  if (!data) notFound();
  const { vendor, bundles, certs, seo, hasVouchers } = data;

  const bundleRank = (bundle: (typeof bundles)[number]) => catalogSearchRank(query, [
    bundle.title,
    ...bundleSearchAliases(bundle.slug),
    ...bundle.items.flatMap((item) => [item.exam.code, item.exam.title])
  ]);
  const visibleBundles = query
    ? bundles.filter((bundle) =>
        matchesCatalogSearch(query, [
          vendor.name,
          bundle.title,
          bundle.description,
          ...bundleSearchAliases(bundle.slug),
          ...bundle.items.flatMap((item) => [
            item.exam.vendor.name,
            item.exam.code,
            item.exam.title,
            item.exam.level,
            item.exam.description
          ])
        ])
      ).sort((a, b) => bundleRank(b) - bundleRank(a))
    : bundles;
  type Card = { kind: 'bundle'; data: (typeof bundles)[number] };
  const cards: Card[] = visibleBundles.map(b => ({ kind: 'bundle' as const, data: b }));

  const jsonLd = vendorLandingJsonLd({
    heading: seo.heading,
    description: seo.metaDescription,
    path: `/practice-exams/${slug}`,
    crumbs: [{ name: 'Practice Exams', path: '/practice-exams' }, { name: vendor.name, path: `/practice-exams/${slug}` }],
    items: certs.map((c) => ({ name: `${c.title} Practice Exam`, path: c.href }))
  });

  return (
    <div className="container-app py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/practice-exams" className="hover:text-brand-700 hover:underline dark:hover:text-brand-300">Practice Exams</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="text-ink dark:text-slate-200">{vendor.name}</span>
      </nav>
      <div className="max-w-3xl">
        <p className="eyebrow mb-2">{bundles.length} Certification{bundles.length === 1 ? '' : 's'}</p>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{seo.heading}</h1>
        {vendor.description && <p className="mt-2 text-slate-600 dark:text-slate-300">{vendor.description}</p>}
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Every Practice Exam is <Price cents={PRACTICE_PRICE_CENTS} />. Booking the real exam? The Exam Voucher includes the Practice Exam free.
        </p>
      </div>

      <form action={`/practice-exams/${slug}`} method="get" className="mt-6 flex max-w-2xl items-center gap-2 rounded-full border border-line bg-white p-1.5 shadow-card dark:border-slate-700 dark:bg-slate-900">
        <Search className="ml-3 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
        <input
          name="q"
          type="search"
          defaultValue={query}
          aria-label={`Search ${vendor.name} Practice Exams`}
          placeholder={`Search ${vendor.name} Practice Exams by code or title`}
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none dark:placeholder:text-slate-500"
        />
        <button type="submit" className="btn-primary-grad min-h-[40px] rounded-full">Search</button>
      </form>

      {query && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span>{cards.length} result{cards.length === 1 ? '' : 's'} for “{query}”</span>
          <Link href={`/practice-exams/${slug}`} className="font-medium text-blue-600 hover:underline dark:text-blue-300">Clear search</Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(card => <ProductCard key={`b-${card.data.id}`} b={card.data} query={query} showVendor={false} />)}
        {cards.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400">
            {query ? `No ${vendor.name} Practice Exams match “${query}”.` : 'No Practice Exams yet for this Vendor.'}
          </p>
        )}
      </div>

      {!query && (
        <div className="mt-10 max-w-3xl">
          <VendorSeoCopy
            kind="practice"
            brand={seo.brand}
            vendor={vendor.name}
            certs={certs}
            siblingHref={hasVouchers ? `/exam-vouchers/${slug}` : null}
          />
        </div>
      )}

      <VoucherUpsellBanner className="mt-10" />
    </div>
  );
}
