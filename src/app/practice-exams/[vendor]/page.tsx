import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { practiceExamCount, practiceExamLabel, practiceQuestionTotal } from '@/lib/bundle-contents';

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

export default async function VendorCatalogPage({ params }: { params: Promise<{ vendor: string }> }) {
  const { vendor: slug } = await params;
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

  type Card = { kind: 'bundle'; data: (typeof bundles)[number] };
  const cards: Card[] = bundles.map(b => ({ kind: 'bundle' as const, data: b }));

  return (
    <div className="container-app py-10">
      <div className="mb-2 text-sm">
        <Link href="/practice-exams" className="text-blue-600 hover:underline">All exams</Link>
        <span className="text-slate-400"> / </span>
        <span>{vendor.name}</span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight">{vendor.name}</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-300">{vendor.description}</p>

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
        {cards.length === 0 && <p className="text-slate-500">No bundles yet for this vendor.</p>}
      </div>
    </div>
  );
}
