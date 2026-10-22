import Link from 'next/link';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';

// ISR: voucher prices change rarely (admin edits), same cadence as /vendors.
export const revalidate = 600;

export const metadata = {
  title: 'Exam Vouchers | Tertiary Exams',
  description: 'Buy official certification exam vouchers — every voucher includes full practice exam access.'
};

export default async function ExamVouchersPage() {
  // A product sells a voucher when priceVoucher is set (see schema Bundle).
  const bundles = await db.bundle.findMany({
    where: { published: true, priceVoucher: { not: null } },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      price: true,
      priceVoucher: true,
      items: { take: 1, select: { exam: { select: { code: true, level: true, vendor: { select: { name: true, slug: true } } } } } }
    },
    orderBy: { title: 'asc' }
  });

  // Group by vendor so the page reads like a price list.
  const byVendor = new Map<string, { name: string; slug: string; bundles: typeof bundles }>();
  for (const b of bundles) {
    const vendor = b.items[0]?.exam.vendor;
    if (!vendor) continue;
    const group = byVendor.get(vendor.slug) ?? { name: vendor.name, slug: vendor.slug, bundles: [] };
    group.bundles.push(b);
    byVendor.set(vendor.slug, group);
  }
  const groups = [...byVendor.values()].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="container-app py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Exam vouchers</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Book your certification exam with an official voucher. Every voucher includes full access to our practice exam for that certification.
        </p>
      </div>

      {groups.length === 0 && (
        <div className="rounded-lg border border-slate-200 p-5 text-sm dark:border-slate-800">
          <p className="font-medium">No exam vouchers are available right now.</p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Browse our <Link href="/practice-exams" className="text-blue-700 hover:underline dark:text-blue-300">practice exams</Link> or <Link href="/p/support" className="text-blue-700 hover:underline dark:text-blue-300">contact support</Link>.
          </p>
        </div>
      )}

      <div className="space-y-10">
        {groups.map(group => (
          <section key={group.slug}>
            <h2 className="eyebrow mb-3">{group.name}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.bundles.map(b => {
                const exam = b.items[0]?.exam;
                const productHref = `/practice-exams/${group.slug}/${b.slug}`;
                return (
                  <div key={b.id} className="card flex flex-col p-5">
                    {exam && (
                      <div className="eyebrow mb-1.5 flex flex-wrap items-center gap-x-1.5 text-[11px]">
                        <span>{exam.code}</span>
                        <span aria-hidden="true">·</span><span>{exam.level}</span>
                      </div>
                    )}
                    <h3 className="font-semibold">
                      <Link href={productHref} className="hover:underline">{b.title}</Link>
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Exam voucher · practice exam included</p>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                      <span className="text-lg font-semibold text-blue-700 dark:text-blue-300">{formatPrice(b.priceVoucher!)}</span>
                      <div className="flex items-center gap-2">
                        <Link href={productHref} className="btn-ghost text-sm">Details</Link>
                        <Link href={`/checkout/bundle/${b.id}?tier=VOUCHER`} className="btn-primary text-sm">Buy voucher</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
