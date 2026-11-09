import Link from 'next/link';
import { ArrowRight, Ticket } from 'lucide-react';
import { db } from '@/lib/db';
import { certNames, sortForVendorSeo, vendorSeoBrand } from '@/lib/exam-seo';
import { displayExamCode, practiceHref, practiceOnSale, voucherHref, voucherOnSale } from '@/lib/products';
import { pageMeta } from '@/lib/seo-meta';

// ISR: vendor list + per-vendor product counts cache for 10 min.
// Vendor catalog changes infrequently (vendors are added rarely; product
// publish counts shift on the same cadence as the homepage at most).
export const revalidate = 600;

export const metadata = pageMeta({
  title: 'All Certifications in Singapore: Practice Exams & Exam Vouchers',
  description: 'Every certification we cover in Singapore by Vendor: AWS, Microsoft, Claude CCAR-F, CKA, CompTIA, Google Cloud, Cisco and more. Practice exams and vouchers.',
  path: '/vendors'
});

export default async function VendorsPage() {
  const [vendors, products] = await Promise.all([
    db.vendor.findMany({ orderBy: { name: 'asc' }, select: { id: true, slug: true, name: true, description: true } }),
    // A product's vendor is derived from its practice exam's vendor.
    db.bundle.findMany({
      where: { OR: [{ published: true }, { priceVoucher: { not: null }, voucherPublished: true }] },
      select: {
        id: true,
        slug: true,
        title: true,
        voucherSlug: true,
        price: true,
        published: true,
        priceVoucher: true,
        voucherPublished: true,
        items: { where: { tier: 'PRACTICE' }, take: 1, select: { exam: { select: { code: true, vendor: { select: { slug: true } } } } } }
      }
    })
  ]);
  const counts = new Map<string, { practice: number; vouchers: number }>();
  for (const p of products) {
    const vs = p.items[0]?.exam.vendor.slug;
    if (!vs) continue;
    const c = counts.get(vs) ?? { practice: 0, vouchers: 0 };
    if (p.published) c.practice += 1;
    if (p.priceVoucher != null && p.voucherPublished) c.vouchers += 1;
    counts.set(vs, c);
  }
  const certsFor = (slug: string, name: string) => sortForVendorSeo(slug, products
    .filter((p) => p.items[0]?.exam.vendor.slug === slug)
    .map((p) => {
      const names = certNames({ title: p.title, code: displayExamCode(p.items[0].exam.code), vendor: name });
      return {
        id: p.id,
        key: names.key,
        base: names.base,
        practice: practiceOnSale(p) ? practiceHref(slug, p) : null,
        voucher: voucherOnSale(p) ? voucherHref(slug, p) : null
      };
    }), (c) => c.key);
  const listed = vendors
    .map((v) => ({ ...v, ...(counts.get(v.slug) ?? { practice: 0, vouchers: 0 }) }))
    .filter((v) => v.practice + v.vouchers > 0);

  return (
    <div className="container-app py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">All Certifications in Singapore, by Vendor</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Pick a Vendor, or go straight to a Certification&apos;s Practice Exam or Exam Voucher below.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listed.map((v) => (
          <Link key={v.id} href={`/practice-exams/${v.slug}`} className="card-hover group flex items-center gap-4 p-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-sky-100 font-display text-lg font-extrabold text-brand-700 dark:from-brand-500/20 dark:to-sky-500/10 dark:text-brand-300">
              {v.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-display font-bold group-hover:text-brand-700 dark:group-hover:text-brand-300">{v.name}</span>
              <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{v.practice} Practice Exam{v.practice === 1 ? '' : 's'}</span>
                {v.vouchers > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-300">
                    <Ticket className="h-3 w-3" aria-hidden="true" /> {v.vouchers} Exam Voucher{v.vouchers === 1 ? '' : 's'}
                  </span>
                )}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" aria-hidden="true" />
          </Link>
        ))}
        {listed.length === 0 && <p className="text-slate-500 dark:text-slate-400">No Vendors yet.</p>}
      </div>

      {/* Every certification, one click from a crawlable page. */}
      {listed.map((v) => (
        <section key={v.id} id={v.slug} className="mt-6 scroll-mt-24">
          <h2 className="font-display text-xl font-bold">
            <Link href={`/practice-exams/${v.slug}`} className="hover:text-brand-700 hover:underline dark:hover:text-brand-300">{vendorSeoBrand(v.slug, v.name).brand} certifications</Link>
          </h2>
          <ul className="mt-2 grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {certsFor(v.slug, v.name).map((c) => (
              <li key={c.id} className="min-w-0 border-t border-line py-2 dark:border-slate-800">
                <span className="block truncate font-medium text-ink dark:text-slate-100" title={c.base}>{c.base}</span>
                <span className="text-sm">
                  {c.practice && <Link href={c.practice} className="text-brand hover:underline dark:text-brand-300">{c.key} practice exam</Link>}
                  {c.practice && c.voucher && <span className="text-slate-400"> · </span>}
                  {c.voucher && <Link href={c.voucher} className="text-emerald-700 hover:underline dark:text-emerald-300">exam voucher</Link>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
