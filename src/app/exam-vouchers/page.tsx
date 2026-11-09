import Link from 'next/link';
import { Price } from '@/components/price';
import { ArrowRight, BookOpen, ChevronDown, ShoppingCart, CalendarCheck } from 'lucide-react';
import { db } from '@/lib/db';
import { serializeJsonLd } from '@/lib/structured-data';
import { bundleSearchAliases, catalogSearchRank, matchesCatalogSearch } from '@/lib/catalog-search';
import { FeatureCards, type Feature } from '@/components/feature-cards';
import { pageMeta } from '@/lib/seo-meta';
import { VOUCHER_PROMISES, VoucherCard } from '@/components/storefront/voucher-card';
import { CatalogFilters } from '../practice-exams/filters';
import { PRACTICE_PRICE_CENTS, VOUCHER_DELIVERY_TEXT, voucherTitleFor } from '@/lib/products';

// A catalog filtered only by Vendor duplicates that Vendor's landing page
// (/exam-vouchers/[vendor]), so it names that page as canonical.
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string; level?: string; vendor?: string }> }) {
  const sp = await searchParams;
  const vendorOnly = sp.vendor && !sp.q && !sp.level && /^[a-z0-9-]+$/.test(sp.vendor);
  return pageMeta({ ...metadata, path: vendorOnly ? `/exam-vouchers/${sp.vendor}` : '/exam-vouchers' });
}

const metadata = {
  title: 'Official Exam Vouchers in Singapore | Tertiary Exams',
  description:
    'Buy official exam vouchers in Singapore for AWS, Microsoft, Claude CCAR-F, CKA, CompTIA Security+ and more. Practice exam included free, GST tax invoice.',
  keywords: 'exam voucher Singapore, certification exam voucher Singapore, exam vouchers for Microsoft certifications, exam vouchers for AWS certifications, exam vouchers for Claude certifications, CKA exam voucher, CKAD exam voucher, CompTIA exam voucher Singapore'
};

const STEPS = [
  { icon: ShoppingCart, t: 'Buy the Exam Voucher', d: 'Pick your Certification and check out securely online.' },
  { icon: BookOpen, t: 'Start practising today', d: 'The Practice Exam unlocks instantly: Practice mode with explanations, plus timed Exam mode.' },
  { icon: CalendarCheck, t: 'Book your real exam', d: 'Redeem the emailed voucher code with the Vendor’s testing partner and book a date when you’re ready.' }
];

const FAQS = [
  {
    q: 'Are these official Exam Vouchers?',
    a: 'Yes. Each Exam Voucher is a genuine code issued by the Certification Vendor and redeemed on the Vendor’s own exam registration site or testing partner (for example Pearson VUE).'
  },
  {
    q: 'What does an Exam Voucher include?',
    a: 'One attempt at the official Certification exam, plus full access to our Practice Exam for the same Certification — Practice mode with explanations and timed Exam mode, with unlimited retakes.'
  },
  {
    q: 'When will I receive my voucher code?',
    a: `By email within ${VOUCHER_DELIVERY_TEXT} of payment. Your Practice Exam is available immediately in your dashboard.`
  },
  {
    q: 'How long is an Exam Voucher valid?',
    a: 'Validity is set by the Vendor and is usually 12 months from issue. The expiry date is shown with your voucher; book your exam before it.'
  },
  {
    q: 'Can I get a refund?',
    a: 'The voucher portion is non-refundable once the code has been delivered, because we have already paid the Vendor. Before it is delivered, contact us and we will cancel and refund it. See our Refund Policy for details.'
  }
];

const LEVELS = ['Foundational', 'Associate', 'Professional', 'Specialty'];

export default async function ExamVouchersPage({ searchParams }: { searchParams: Promise<{ q?: string; level?: string; vendor?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q || '').trim();
  // An Exam Voucher is on sale when it has a price and voucherPublished
  // (voucherOnSale in lib/products) — independent of the Practice Exam's status.
  const bundles = await db.bundle.findMany({
    where: { priceVoucher: { not: null }, voucherPublished: true },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      price: true,
      priceVoucher: true,
      published: true,
      voucherSlug: true,
      voucherTitle: true,
      voucherPublished: true,
      items: { where: { tier: 'PRACTICE' }, take: 1, select: { exam: { select: { code: true, title: true, level: true, vendor: { select: { id: true, name: true, slug: true } } } } } }
    },
    orderBy: { title: 'asc' }
  });

  // Same search/filters as /practice-exams; vendor then title reads like a price list.
  const priced = bundles
    .filter((b) => b.items[0]?.exam.vendor)
    .sort((a, b) => a.items[0].exam.vendor.name.localeCompare(b.items[0].exam.vendor.name) || voucherTitleFor(a).localeCompare(voucherTitleFor(b)));
  const vendors = [...new Map(priced.map((b) => [b.items[0].exam.vendor.slug, b.items[0].exam.vendor])).values()];
  const visible = priced.filter((b) => {
    const exam = b.items[0].exam;
    if (sp.vendor && exam.vendor.slug !== sp.vendor) return false;
    if (sp.level && exam.level !== sp.level) return false;
    if (q && !matchesCatalogSearch(q, [voucherTitleFor(b), b.title, b.description, ...bundleSearchAliases(b.slug), exam.vendor.name, exam.vendor.slug, exam.code, exam.title, exam.level])) return false;
    return true;
  });
  if (q) {
    const rank = new Map(visible.map((b) => [b.id, catalogSearchRank(q, [voucherTitleFor(b), b.title, ...bundleSearchAliases(b.slug), b.items[0].exam.code, b.items[0].exam.title])]));
    visible.sort((a, b) => rank.get(b.id)! - rank.get(a.id)!);
  }
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  };

  return (
    <div className="container-app py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Official Exam Vouchers in Singapore — <span className="text-emerald-700 dark:text-emerald-300">Practice Exam included free</span></h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Book your Certification exam with a genuine Vendor-issued <b className="text-ink dark:text-white">exam voucher in Singapore</b>, and prepare for it with the Practice Exam (worth <Price cents={PRACTICE_PRICE_CENTS} />) at no extra cost.
        </p>
      </div>

      <FeatureCards items={VOUCHER_PROMISES} tone="emerald" />

      <CatalogFilters
        q={q}
        vendor={sp.vendor || ''}
        level={sp.level || ''}
        vendors={vendors}
        levels={LEVELS}
        basePath="/exam-vouchers"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((b) => <VoucherCard key={b.id} b={{ ...b, exam: b.items[0].exam }} />)}
        {visible.length === 0 && (
          <div className="rounded-lg border border-line bg-white p-5 text-sm sm:col-span-2 lg:col-span-3 dark:border-slate-800 dark:bg-slate-900/80">
            <p className="font-medium">{priced.length === 0 ? 'No Exam Vouchers are available right now.' : 'No Exam Vouchers match your search.'}</p>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Browse our <Link href="/practice-exams" className="text-blue-700 hover:underline dark:text-blue-300">Practice Exams</Link> or <Link href="/p/support" className="text-blue-700 hover:underline dark:text-blue-300">contact support</Link>.
            </p>
          </div>
        )}
      </div>

      <section className="mt-6">
        <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, t, d }, i) => (
            <li key={t} className="card p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">{i + 1}</span>
                <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
              </div>
              <div className="mt-3 font-semibold">{t}</div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6">
        <h2 className="text-2xl font-bold tracking-tight">Exam Voucher questions</h2>
        <div className="mt-4 divide-y divide-line rounded-lg border border-line bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/80">
          {FAQS.map((f) => (
            <details key={f.q} className="group p-4">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 font-medium marker:hidden">
                <span>{f.q}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Only need practice? <Link href="/practice-exams" className="inline-flex items-center gap-0.5 text-blue-700 hover:underline dark:text-blue-300">Browse Practice Exams — <Price cents={PRACTICE_PRICE_CENTS} /> each <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link> · More questions? <Link href="/p/support" className="text-blue-700 hover:underline dark:text-blue-300">Contact support</Link> · <Link href="/p/refund-policy" className="text-blue-700 hover:underline dark:text-blue-300">Refund Policy</Link>
        </p>
      </section>
    </div>
  );
}
