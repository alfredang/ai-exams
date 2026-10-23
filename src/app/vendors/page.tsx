import Link from 'next/link';
import { ArrowRight, Ticket } from 'lucide-react';
import { db } from '@/lib/db';

// ISR: vendor list + per-vendor product counts cache for 10 min.
// Vendor catalog changes infrequently (vendors are added rarely; product
// publish counts shift on the same cadence as the homepage at most).
export const revalidate = 600;

export default async function VendorsPage() {
  const [vendors, products] = await Promise.all([
    db.vendor.findMany({ orderBy: { name: 'asc' }, select: { id: true, slug: true, name: true, description: true } }),
    // A product's vendor is derived from its practice exam's vendor.
    db.bundle.findMany({
      where: { OR: [{ published: true }, { priceVoucher: { not: null }, voucherPublished: true }] },
      select: {
        published: true,
        priceVoucher: true,
        voucherPublished: true,
        items: { take: 1, select: { exam: { select: { vendor: { select: { slug: true } } } } } }
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
  const listed = vendors
    .map((v) => ({ ...v, ...(counts.get(v.slug) ?? { practice: 0, vouchers: 0 }) }))
    .filter((v) => v.practice + v.vouchers > 0);

  return (
    <div className="container-app py-10">
      <div className="mb-8 max-w-3xl">
        <p className="eyebrow mb-2">Vendors</p>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Browse by Vendor</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Pick a Vendor to see its Practice Exams and Exam Vouchers.</p>
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
    </div>
  );
}
