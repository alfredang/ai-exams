import Link from 'next/link';
import { BadgeCheck, BookOpen, Mail, ReceiptText, ShoppingCart, CalendarCheck } from 'lucide-react';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { serializeJsonLd } from '@/lib/structured-data';

// ISR: voucher prices change rarely (admin edits), same cadence as /vendors.
export const revalidate = 600;

export const metadata = {
  title: 'Exam Vouchers | Tertiary Exams',
  description:
    'Buy official certification exam vouchers for CompTIA, Microsoft, AWS, Google Cloud and more — every voucher includes our full practice exam at no extra cost, with a GST tax invoice.'
};

const PROMISES = [
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

      <ul className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PROMISES.map(({ icon: Icon, t, d }) => (
          <li key={t} className="card flex gap-3 p-4">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden="true" />
            <div>
              <div className="text-sm font-semibold">{t}</div>
              <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{d}</div>
            </div>
          </li>
        ))}
      </ul>

      {groups.length > 3 && (
        <nav aria-label="Jump to vendor" className="mb-8 flex flex-wrap gap-2">
          {groups.map((g) => (
            <a key={g.slug} href={`#${g.slug}`} className="btn-outline px-3 py-1.5 text-xs">
              {g.name}
            </a>
          ))}
        </nav>
      )}

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
          <section key={group.slug} id={group.slug} className="scroll-mt-24">
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
            </div>
          </section>
        ))}
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
