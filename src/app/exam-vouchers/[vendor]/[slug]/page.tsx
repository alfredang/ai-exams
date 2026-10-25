import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Award, BadgeCheck, BookOpen, CalendarCheck, Gift, Mail, ReceiptText, ShieldCheck, ShoppingCart, Ticket, Timer } from 'lucide-react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';
import { PUBLIC_SITE_URL, serializeJsonLd } from '@/lib/structured-data';
import { STORE_CURRENCY } from '@/lib/currency';
import {
  PRACTICE_PRICE_CENTS, VOUCHER_DELIVERY_TEXT, checkoutHref, displayExamCode, practiceHref, practiceOnSale,
  voucherDescriptionFor, voucherHref, voucherOnSale, voucherSlugFor, voucherTitleFor
} from '@/lib/products';
import { ExamDomains } from '@/components/exam-domains';
import { Breadcrumbs, CheckList, FaqList, InstructorLedCard, MobileBuyBar, StatTile } from '@/components/product/product-parts';
import { instructorLedCourseFor } from '@/lib/instructor-led';

const FAQS = [
  { q: 'Is this an official exam voucher?', a: 'Yes. It is a genuine code issued by the certification vendor, redeemed on the vendor’s own registration site or testing partner (for example Pearson VUE).' },
  { q: 'When do I receive the voucher code?', a: `By email within ${VOUCHER_DELIVERY_TEXT} of payment. Your practice exam unlocks immediately in your dashboard, so you can start preparing straight away.` },
  { q: 'Is the practice exam really included?', a: `Yes — the full practice exam for this certification (normally ${formatPrice(PRACTICE_PRICE_CENTS)}) is added to your account automatically. No separate purchase needed.` },
  { q: 'How long is the voucher valid?', a: 'Validity is set by the vendor and is usually 12 months from issue. The expiry date is shown with your voucher; book your exam before it.' },
  { q: 'Can I get a refund?', a: 'Before the code is delivered, contact us and we will cancel and refund it. Once delivered, the voucher portion is non-refundable because we have already paid the vendor. See our Refund Policy.' }
];

async function loadVoucher(slug: string) {
  const include = {
    items: {
      orderBy: { position: 'asc' as const },
      include: { exam: { include: { vendor: true, _count: { select: { questions: { where: { status: 'PUBLISHED' as const } } } } } } }
    }
  };
  const bySlug = await db.bundle.findUnique({ where: { voucherSlug: slug }, include });
  if (bySlug) return bySlug;
  // Products created before their voucher slug was filled in.
  if (!slug.endsWith('-exam-voucher')) return null;
  const legacy = await db.bundle.findUnique({ where: { slug: slug.replace(/-exam-voucher$/, '') }, include });
  return legacy && !legacy.voucherSlug ? legacy : null;
}

export async function generateMetadata({ params }: { params: Promise<{ vendor: string; slug: string }> }): Promise<Metadata> {
  const { vendor, slug } = await params;
  const p = await loadVoucher(slug);
  if (!p || !voucherOnSale(p)) return {};
  const exam = (p.items.find((i) => i.tier === 'PRACTICE') ?? p.items[0])?.exam;
  const title = `${voucherTitleFor(p)} | Tertiary Exams`;
  const description = voucherDescriptionFor(p, { vendorName: exam?.vendor.name, code: displayExamCode(exam?.code) }).slice(0, 170);
  return { title, description, openGraph: { title, description }, alternates: { canonical: `/exam-vouchers/${vendor}/${voucherSlugFor(p)}` } };
}

export default async function ExamVoucherPage({ params }: { params: Promise<{ vendor: string; slug: string }> }) {
  const { vendor: vendorSlug, slug } = await params;
  const product = await loadVoucher(slug);
  const exam = product && (product.items.find((i) => i.tier === 'PRACTICE') ?? product.items[0])?.exam;
  if (!product || !exam || !voucherOnSale(product)) notFound();
  if (exam.vendor.slug !== vendorSlug || voucherSlugFor(product) !== slug) {
    permanentRedirect(voucherHref(exam.vendor.slug, product));
  }

  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  const ownsVoucher = !!userId && !!(await db.entitlement.findFirst({ where: { userId, examId: exam.id, tier: 'VOUCHER' }, select: { id: true } }));

  const vendor = exam.vendor;
  const code = displayExamCode(exam.code);
  const title = voucherTitleFor(product);
  const description = voucherDescriptionFor(product, { vendorName: vendor.name, code });
  const price = product.priceVoucher!;
  const buyHref = checkoutHref(product.id, 'VOUCHER');
  const practicePage = practiceOnSale(product) ? practiceHref(vendor.slug, product) : null;
  const poolSize = exam._count.questions;
  const perAttempt = Math.min(exam.questionCount, poolSize);
  const course = instructorLedCourseFor(product.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description,
    sku: `${code}-VOUCHER`,
    category: 'Certification exam voucher',
    url: `${PUBLIC_SITE_URL}${voucherHref(vendor.slug, product)}`,
    brand: { '@type': 'Brand', name: vendor.name },
    offers: {
      '@type': 'Offer',
      name: 'Exam Voucher (practice exam included)',
      url: `${PUBLIC_SITE_URL}${buyHref}`,
      priceCurrency: STORE_CURRENCY,
      price: (price / 100).toFixed(2),
      availability: 'https://schema.org/InStock'
    }
  };
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-br from-emerald-50 via-sky-50 to-page dark:border-slate-800 dark:from-[#062a26] dark:via-slate-950 dark:to-slate-950">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/15" aria-hidden="true" />
        <div className="container-app relative py-8 md:py-10">
          <Breadcrumbs items={[
            { href: '/exam-vouchers', label: 'Exam Vouchers' },
            { href: `/exam-vouchers?vendor=${vendor.slug}`, label: vendor.name },
            { label: code }
          ]} />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white"><Ticket className="h-3 w-3" aria-hidden="true" /> Official Exam Voucher</span>
            <span className="badge">{vendor.name}</span>
            <span className="badge">{code}</span>
            <span className="badge">{exam.level}</span>
          </div>
          <h1 className="mt-3 text-balance font-display text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">{description}</p>
          <div className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-xl border border-emerald-300/70 bg-white/80 px-4 py-2.5 text-sm shadow-card dark:border-emerald-500/40 dark:bg-slate-900/70">
            <Gift className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span><b>Practice exam included free</b> — worth {formatPrice(PRACTICE_PRICE_CENTS)}, unlocked the moment you pay.</span>
          </div>
        </div>
      </section>

      <div className="container-app grid gap-8 py-8 lg:grid-cols-3">
        <div className="min-w-0 space-y-8 lg:col-span-2">
          <section>
            <h2 className="font-display text-xl font-bold">What&apos;s included</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="card p-5">
                <Ticket className="h-6 w-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">Official {code} exam voucher</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">One attempt at the real {vendor.name} certification exam. Emailed within {VOUCHER_DELIVERY_TEXT}.</p>
              </div>
              <div className="card p-5">
                <BookOpen className="h-6 w-6 text-brand dark:text-brand-300" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">{code} Practice Exam <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">FREE</span></h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {poolSize}-question pool, {perAttempt} per attempt, timed Exam mode + Practice mode, unlimited retakes.
                  {practicePage && <> <Link href={practicePage} className="font-medium text-brand hover:underline dark:text-brand-300">See the practice exam</Link></>}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">How it works</h2>
            <ol className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                { icon: ShoppingCart, t: 'Buy the voucher', d: 'Pay securely online and get a tax invoice straight away.' },
                { icon: BookOpen, t: 'Practise today', d: 'Your practice exam unlocks instantly — find your weak domains early.' },
                { icon: CalendarCheck, t: 'Book your exam', d: 'Redeem the emailed code with the vendor and pick your exam date.' }
              ].map(({ icon: Icon, t, d }, i) => (
                <li key={t} className="card p-5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">{i + 1}</span>
                    <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  </div>
                  <div className="mt-3 font-semibold">{t}</div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{d}</p>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">About the {code} exam</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              <StatTile icon={Award} label="Level" value={exam.level} />
              <StatTile icon={Timer} label="Practice timer" value={`${exam.durationMinutes} min`} />
              <StatTile icon={BadgeCheck} label="Practice pass mark" value={`${exam.passingScore}%`} />
            </div>
            <ExamDomains domains={exam.domains} productSlug={product.slug} />
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">Voucher questions</h2>
            <div className="mt-4"><FaqList items={FAQS} /></div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              {practicePage && <>Only need practice? <Link href={practicePage} className="text-brand hover:underline dark:text-brand-300">{code} Practice Exam · {formatPrice(product.price)}</Link> · </>}
              <Link href="/p/refund-policy" className="text-brand hover:underline dark:text-brand-300">Refund Policy</Link> · <Link href="/p/support" className="text-brand hover:underline dark:text-brand-300">Contact support</Link>
            </p>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-300/70 bg-white p-5 shadow-lift dark:border-emerald-500/40 dark:bg-slate-900">
            <div className="eyebrow">Exam Voucher</div>
            <div className="mt-1 font-display text-3xl font-extrabold text-ink dark:text-white">{formatPrice(price)}</div>
            <div className="text-sm text-muted dark:text-slate-400">Practice exam included — no extra cost</div>
            <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm dark:bg-emerald-950/30">
              <div className="flex justify-between"><span>{code} exam voucher</span><span className="font-medium">{formatPrice(price)}</span></div>
              <div className="mt-1 flex justify-between"><span>{code} Practice Exam</span><span className="font-medium"><s className="text-muted">{formatPrice(PRACTICE_PRICE_CENTS)}</s> <span className="text-emerald-700 dark:text-emerald-300">FREE</span></span></div>
            </div>
            {ownsVoucher ? (
              <Link href="/user-dashboard/vouchers" className="btn-outline mt-5 min-h-[44px] w-full">You own this voucher — view it</Link>
            ) : (
              <Link href={buyHref} className="btn mt-5 inline-flex min-h-[44px] w-full items-center justify-center bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400">Buy Exam Voucher</Link>
            )}
            <div className="mt-4">
              <CheckList tone="emerald" items={[
                <span key="m" className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" aria-hidden="true" /> Code emailed in {VOUCHER_DELIVERY_TEXT}</span>,
                <span key="r" className="inline-flex items-center gap-1"><ReceiptText className="h-3.5 w-3.5" aria-hidden="true" /> Tax invoice with every order</span>,
                <span key="s" className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Refundable until the code is issued</span>
              ]} />
            </div>
          </div>
          {course && <InstructorLedCard course={course} code={code} />}
        </aside>
      </div>

      {!ownsVoucher && <MobileBuyBar label={`${code} voucher + free practice exam`} price={price} href={buyHref} cta="Buy voucher" />}
    </div>
  );
}
