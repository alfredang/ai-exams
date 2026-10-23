import Link from 'next/link';
import { BadgeCheck, BookOpen, Mail, ReceiptText, ShoppingCart, CalendarCheck } from 'lucide-react';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { serializeJsonLd } from '@/lib/structured-data';
import { bundleSearchAliases, catalogSearchRank, matchesCatalogSearch } from '@/lib/catalog-search';
import { FeatureCards, type Feature } from '@/components/feature-cards';
import { CatalogFilters } from '../practice-exams/filters';

export const metadata = {
  title: 'Exam Vouchers | Tertiary Exams',
  description:
    'Buy official certification exam vouchers for CompTIA, Microsoft, AWS, Google Cloud and more — every voucher includes our full practice exam at no extra cost, with a GST tax invoice.'
};

const PROMISES: Feature[] = [
  { icon: BadgeCheck, t: 'Official vouchers', d: 'Genuine vendor-issued codes, redeemable for the real certification exam.' },
  { icon: BookOpen, t: 'Practice exam included', d: 'Unlimited timed practice for the same exam unlocks the moment you pay.' },
  { icon: Mail, t: 'Delivered by email', d: 'Your voucher code arrives within 3–5 business days.' },
  { icon: ReceiptText, t: 'Tax invoice', d: 'Secure checkout and a GST tax invoice for every order.' }
];

const STEPS = [
  { icon: ShoppingCart, t: 'Buy the voucher', d: 'Pick your certification and check out securely by card or Google Pay.' },
  { icon: BookOpen, t: 'Start practising today', d: 'The practice exam unlocks instantly: practice mode with explanations, plus timed exam mode.' },
  { icon: CalendarCheck, t: 'Book your real exam', d: 'Redeem the emailed voucher code with the vendor’s testing partner and book a date when you’re ready.' }
];

const FAQS = [
  {
    q: 'Are these official exam vouchers?',
    a: 'Yes. Each voucher is a genuine code issued by the certification vendor and redeemed on the vendor’s own exam registration site or testing partner (for example Pearson VUE).'
  },
  {
    q: 'What does a voucher include?',
    a: 'One attempt at the official certification exam, plus full access to our practice exam for the same certification — practice mode with explanations and timed exam mode, with unlimited retakes.'
  },
  {
    q: 'When will I receive my voucher code?',
    a: 'By email within 3–5 business days of payment. Your practice exam is available immediately under My Content.'
  },
  {
    q: 'How long is a voucher valid?',
    a: 'Validity is set by the vendor and is usually 12 months from issue. The expiry date is shown with your voucher; book your exam before it.'
  },
  {
    q: 'Can I get a refund?',
    a: 'The voucher portion is non-refundable once the code has been delivered, because we have already paid the vendor. Before it is delivered, contact us and we will cancel and refund it. See our Refund Policy for details.'
  }
];

const LEVELS = ['Foundational', 'Associate', 'Professional', 'Specialty'];

export default async function ExamVouchersPage({ searchParams }: { searchParams: Promise<{ q?: string; level?: string; vendor?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q || '').trim();
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
      items: { take: 1, select: { exam: { select: { code: true, title: true, level: true, vendor: { select: { id: true, name: true, slug: true } } } } } }
    },
    orderBy: { title: 'asc' }
  });

  // Same search/filters as /practice-exams; vendor then title reads like a price list.
  const priced = bundles
    .filter((b) => b.items[0]?.exam.vendor)
    .sort((a, b) => a.items[0].exam.vendor.name.localeCompare(b.items[0].exam.vendor.name) || a.title.localeCompare(b.title));
  const vendors = [...new Map(priced.map((b) => [b.items[0].exam.vendor.slug, b.items[0].exam.vendor])).values()];
  const visible = priced.filter((b) => {
    const exam = b.items[0].exam;
    if (sp.vendor && exam.vendor.slug !== sp.vendor) return false;
    if (sp.level && exam.level !== sp.level) return false;
    if (q && !matchesCatalogSearch(q, [b.title, b.description, ...bundleSearchAliases(b.slug), exam.vendor.name, exam.vendor.slug, exam.code, exam.title, exam.level])) return false;
    return true;
  });
  if (q) {
    const rank = new Map(visible.map((b) => [b.id, catalogSearchRank(q, [b.title, ...bundleSearchAliases(b.slug), b.items[0].exam.code, b.items[0].exam.title])]));
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
        <p className="eyebrow mb-2">Exam vouchers</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Official exam vouchers, practice exam included</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Book your certification exam with a genuine vendor voucher — and prepare for it with our full practice exam for that certification at no extra cost.
        </p>
      </div>

      <FeatureCards items={PROMISES} />

      <CatalogFilters
        q={q}
        vendor={sp.vendor || ''}
        level={sp.level || ''}
        vendors={vendors}
        levels={LEVELS}
        basePath="/exam-vouchers"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((b) => {
          const exam = b.items[0].exam;
          const productHref = `/practice-exams/${exam.vendor.slug}/${b.slug}`;
          return (
            <div key={b.id} className="card flex flex-col p-5">
              <div className="eyebrow mb-1.5 flex flex-wrap items-center gap-x-1.5 text-[11px]">
                <span>{exam.vendor.name}</span>
                <span aria-hidden="true">·</span><span>{exam.code}</span>
                <span aria-hidden="true">·</span><span>{exam.level}</span>
              </div>
              <h3 className="font-semibold">
                <Link href={productHref} className="hover:underline">{b.title}</Link>
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex gap-1.5"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />Official exam voucher, emailed in 3–5 business days</li>
                <li className="flex gap-1.5">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  Practice exam included{b.price > 0 ? ` (worth ${formatPrice(b.price)})` : ''}
                </li>
              </ul>
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
        {visible.length === 0 && (
          <div className="rounded-lg border border-slate-200 p-5 text-sm md:col-span-2 lg:col-span-3 dark:border-slate-800">
            <p className="font-medium">{priced.length === 0 ? 'No exam vouchers are available right now.' : 'No exam vouchers match your search.'}</p>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Browse our <Link href="/practice-exams" className="text-blue-700 hover:underline dark:text-blue-300">practice exams</Link> or <Link href="/p/support" className="text-blue-700 hover:underline dark:text-blue-300">contact support</Link>.
            </p>
          </div>
        )}
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, t, d }, i) => (
            <li key={t} className="card p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</span>
                <Icon className="h-5 w-5 text-brand-600 dark:text-brand-300" aria-hidden="true" />
              </div>
              <div className="mt-3 font-semibold">{t}</div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 max-w-3xl">
        <h2 className="text-2xl font-bold tracking-tight">Voucher questions</h2>
        <div className="mt-4 divide-y divide-line rounded-lg border border-line bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/80">
          {FAQS.map((f) => (
            <details key={f.q} className="group p-4">
              <summary className="cursor-pointer list-none font-medium marker:hidden">{f.q}</summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Only need practice? <Link href="/practice-exams" className="text-blue-700 hover:underline dark:text-blue-300">Browse practice exams</Link> · More questions? <Link href="/p/support" className="text-blue-700 hover:underline dark:text-blue-300">Contact support</Link> · <Link href="/p/refund-policy" className="text-blue-700 hover:underline dark:text-blue-300">Refund Policy</Link>
        </p>
      </section>
    </div>
  );
}
