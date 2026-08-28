import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { practiceExamCount, practiceExamLabel, practiceQuestionTotal } from '@/lib/bundle-contents';
import { Search } from 'lucide-react';

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

export default async function VendorCatalogPage({
  params,
  searchParams
}: {
  params: Promise<{ vendor: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { vendor: slug } = await params;
  const query = ((await searchParams).q || '').trim();
  // Vendor lookup + filtered bundle query in parallel; the bundle filter is
  // pushed to the DB via items.some so we no longer load the full catalog
  // and filter in JS.
  const [vendor, bundles] = await Promise.all([
    db.vendor.findUnique({ where: { slug } }),
    db.bundle.findMany({
      where: {
        published: true,
        items: { some: { exam: { vendor: { slug } } } }
      },
      include: { items: { include: { exam: { include: { vendor: true } } } } }
    })
  ]);
  if (!vendor) notFound();

  const normalizedQuery = query.toLocaleLowerCase();
  const visibleBundles = normalizedQuery
    ? bundles.filter((bundle) => {
        const searchable = [
          bundle.title,
          bundle.description,
          ...bundle.items.flatMap((item) => [
            item.exam.code,
            item.exam.title,
            item.exam.level,
            item.exam.description
          ])
        ].filter(Boolean).join(' ').toLocaleLowerCase();
        return searchable.includes(normalizedQuery);
      })
    : bundles;
  type Card = { kind: 'bundle'; data: (typeof bundles)[number] };
  const cards: Card[] = visibleBundles.map(b => ({ kind: 'bundle' as const, data: b }));

  return (
    <div className="container-app py-10">
      <div className="mb-2 text-sm">
        <Link href="/practice-exams" className="text-blue-600 hover:underline">All exams</Link>
        <span className="text-slate-400"> / </span>
        <span>{vendor.name}</span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight">{vendor.name}</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-300">{vendor.description}</p>

      <form action={`/practice-exams/${slug}`} method="get" className="mt-6 flex max-w-2xl items-center gap-2 rounded-full border border-slate-200 bg-white p-1.5 shadow-card dark:border-slate-700 dark:bg-slate-900">
        <Search className="ml-3 h-5 w-5 text-slate-400" aria-hidden="true" />
        <input
          name="q"
          type="search"
          defaultValue={query}
          aria-label={`Search ${vendor.name} certification exams`}
          placeholder={`Search ${vendor.name} exams by code or title`}
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none dark:placeholder:text-slate-500"
        />
        <button type="submit" className="btn-primary-grad rounded-full">Search</button>
      </form>

      {query && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span>{cards.length} result{cards.length === 1 ? '' : 's'} for “{query}”</span>
          <Link href={`/practice-exams/${slug}`} className="font-medium text-blue-600 hover:underline dark:text-blue-300">Clear search</Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(card => {
          const b = card.data;
          const first = b.items[0]?.exam;
          // PRACTICE items only — the VOUCHER item points back at the same -p1
          // exam, so counting raw items double-counts it. See bundle-contents.ts.
          const totalQs = practiceQuestionTotal(b.items);
          const examCount = practiceExamCount(b.items);
          return (
            <Link key={`b-${b.id}`} href={first ? `/practice-exams/${first.vendor.slug}/${b.slug}` : `/bundles/${b.slug}`} className="card-hover p-5">
              <div className="mb-2 flex items-center gap-2 text-xs">
                {first && <span className="badge">{first.code}</span>}
                {first && <span className="badge">{first.level}</span>}
              </div>
              <h3 className="font-semibold">{b.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{b.description}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{totalQs} questions · {practiceExamLabel(examCount)}</span>
                <span className="font-semibold text-blue-700 dark:text-blue-300">{b.price === 0 ? 'Free' : `from ${formatPrice(b.price)}`}</span>
              </div>
            </Link>
          );
        })}
        {cards.length === 0 && (
          <p className="text-slate-500">
            {query ? `No ${vendor.name} exams match “${query}”.` : 'No bundles yet for this vendor.'}
          </p>
        )}
      </div>
    </div>
  );
}
