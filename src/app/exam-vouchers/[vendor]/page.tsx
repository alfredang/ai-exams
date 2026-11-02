import { cache } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { db } from '@/lib/db';
import { Price } from '@/components/price';
import { FeatureCards } from '@/components/feature-cards';
import { VOUCHER_PROMISES, VoucherCard } from '@/components/storefront/voucher-card';
import { VendorSeoCopy } from '@/components/product/seo-copy';
import { PRACTICE_PRICE_CENTS, displayExamCode, voucherHref, voucherTitleFor } from '@/lib/products';
import { buildVendorSeo, certNames, sortForVendorSeo } from '@/lib/exam-seo';
import { serializeJsonLd } from '@/lib/structured-data';
import { vendorLandingJsonLd } from '@/lib/vendor-landing';

// The Exam Voucher landing page for one Vendor — "Exam Vouchers for AWS
// Certifications". Used to redirect to /exam-vouchers?vendor=…, which gave
// search engines nothing to rank. A Vendor with no voucher on sale still
// redirects to the full catalog so old links keep working.
export const revalidate = 300;

export async function generateStaticParams() {
  const vendors = await db.vendor.findMany({ select: { slug: true } });
  return vendors.map((v) => ({ vendor: v.slug }));
}

const loadVendorVouchers = cache(async (slug: string) => {
  const [vendor, bundles] = await Promise.all([
    db.vendor.findUnique({ where: { slug } }),
    // On sale = priced + voucherPublished (voucherOnSale in lib/products),
    // independent of the Practice Exam's status.
    db.bundle.findMany({
      where: { priceVoucher: { not: null }, voucherPublished: true, items: { some: { tier: 'PRACTICE', exam: { vendor: { slug } } } } },
      select: {
        id: true, slug: true, title: true, priceVoucher: true, published: true, voucherSlug: true, voucherTitle: true,
        items: { where: { tier: 'PRACTICE' }, take: 1, select: { exam: { select: { code: true, level: true, vendor: { select: { name: true, slug: true } } } } } }
      }
    })
  ]);
  if (!vendor) return null;
  const vouchers = sortForVendorSeo(slug, bundles.filter((b) => b.items[0]).map((b) => ({
    ...b,
    exam: b.items[0].exam,
    key: certNames({ title: b.title, code: displayExamCode(b.items[0].exam.code), vendor: vendor.name }).key
  })), (v) => v.key);
  const seo = buildVendorSeo({ kind: 'voucher', slug, name: vendor.name, keys: vouchers.map((v) => v.key) });
  const sellsPractice = bundles.some((b) => b.published);
  return { vendor, vouchers, seo, sellsPractice };
});

export async function generateMetadata({ params }: { params: Promise<{ vendor: string }> }) {
  const { vendor: slug } = await params;
  const data = await loadVendorVouchers(slug);
  if (!data || data.vouchers.length === 0) return {};
  const { metaTitle: title, metaDescription: description, metaKeywords: keywords } = data.seo;
  return {
    title,
    description,
    keywords,
    openGraph: { title, description },
    alternates: { canonical: `/exam-vouchers/${slug}` }
  };
}

export default async function VendorVouchersPage({ params }: { params: Promise<{ vendor: string }> }) {
  const { vendor: slug } = await params;
  const data = await loadVendorVouchers(slug);
  if (!data) notFound();
  const { vendor, vouchers, seo, sellsPractice } = data;
  if (vouchers.length === 0) redirect('/exam-vouchers');

  const certs = vouchers.map((v) => ({ key: v.key, href: voucherHref(slug, v) }));
  const jsonLd = vendorLandingJsonLd({
    heading: seo.heading,
    description: seo.metaDescription,
    path: `/exam-vouchers/${slug}`,
    crumbs: [{ name: 'Exam Vouchers', path: '/exam-vouchers' }, { name: vendor.name, path: `/exam-vouchers/${slug}` }],
    items: vouchers.map((v) => ({ name: voucherTitleFor(v), path: voucherHref(slug, v) }))
  });

  return (
    <div className="container-app py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/exam-vouchers" className="hover:text-emerald-700 hover:underline dark:hover:text-emerald-300">Exam Vouchers</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="text-ink dark:text-slate-200">{vendor.name}</span>
      </nav>
      <div className="mb-8 max-w-3xl">
        <p className="eyebrow mb-2">{vouchers.length} Exam Voucher{vouchers.length === 1 ? '' : 's'}</p>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{seo.heading}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Genuine {vendor.name}-issued Exam Vouchers, each with the Practice Exam for that Certification
          (worth <Price cents={PRACTICE_PRICE_CENTS} />) <b className="text-emerald-700 dark:text-emerald-300">included free</b>.
        </p>
      </div>

      <FeatureCards items={VOUCHER_PROMISES} tone="emerald" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vouchers.map((v) => <VoucherCard key={v.id} b={v} showVendor={false} />)}
      </div>

      <div className="mt-10 max-w-3xl">
        <VendorSeoCopy
          kind="voucher"
          brand={seo.brand}
          vendor={vendor.name}
          certs={certs}
          siblingHref={sellsPractice ? `/practice-exams/${slug}` : null}
        />
      </div>

      <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
        Looking for another Vendor? <Link href="/exam-vouchers" className="text-blue-700 hover:underline dark:text-blue-300">Browse all Exam Vouchers</Link>
      </p>
    </div>
  );
}
