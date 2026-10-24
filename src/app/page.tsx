import Link from 'next/link';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { DotPattern } from '@/components/dot-pattern';
import { Search, ShieldCheck, Sparkles, Award, ChevronDown, ArrowRight, BookOpenCheck, Ticket, MousePointerClick, Trophy, ListChecks } from 'lucide-react';
import { LandingTestimonials } from '@/components/landing-testimonials';
import { HeroExamVisual } from '@/components/hero-exam-visual';
import { PUBLISHED_QUESTION_COUNT } from '@/lib/bundle-contents';
import { serializeJsonLd } from '@/lib/structured-data';
import { PRACTICE_PRICE_CENTS, VOUCHER_DELIVERY_TEXT } from '@/lib/products';
import { ProductCard } from '@/components/storefront/product-card';
import { CategoryShowcase } from '@/components/storefront/category-showcase';
import { StorefrontMotionStyles } from '@/components/storefront/motion-styles';

// ISR: refetch vendor + popular-product counts at most once every 5 minutes.
// Avoids per-visit DB hits while keeping seed/publish changes visible quickly.
export const revalidate = 300;

const VOUCHER_ON_SALE = { priceVoucher: { not: null }, voucherPublished: true } as const;

export default async function HomePage() {
  const { getTeaserSize } = await import('@/lib/settings');
  const TEASER_N = await getTeaserSize();

  const [products, popular, voucherMin, vendors] = await Promise.all([
    // Vendor counts come from published products (vendor = first item's exam vendor).
    db.bundle.findMany({
      where: { published: true },
      select: { id: true, items: { take: 1, select: { exam: { select: { vendor: { select: { slug: true } } } } } } }
    }),
    db.bundle.findMany({
      where: { published: true },
      include: { items: { orderBy: { position: 'asc' }, include: { exam: { include: { vendor: true, ...PUBLISHED_QUESTION_COUNT } } } } },
      take: 6,
      orderBy: { createdAt: 'desc' }
    }),
    db.bundle.aggregate({ where: VOUCHER_ON_SALE, _min: { priceVoucher: true } }),
    db.vendor.findMany({ orderBy: { name: 'asc' }, select: { id: true, slug: true, name: true } })
  ]);
  const countByVendor = new Map<string, number>();
  for (const b of products) {
    const vs = b.items[0]?.exam.vendor.slug;
    if (vs) countByVendor.set(vs, (countByVendor.get(vs) || 0) + 1);
  }
  const vendorChips = vendors
    .map((v) => ({ ...v, count: countByVendor.get(v.slug) || 0 }))
    .filter((v) => v.count > 0);
  const certCount = products.length;
  const voucherFrom = voucherMin._min.priceVoucher ?? null;
  const practicePrice = formatPrice(PRACTICE_PRICE_CENTS);

  // FAQ entries are managed in /admin-dashboard/faq. The homepage falls
  // back to a built-in list when no published entries exist yet so a fresh
  // install still shows something useful.
  const faqRows = await db.faq.findMany({
    where: { published: true },
    orderBy: { position: 'asc' },
    take: 12
  });
  const sub = (s: string) => s.replace(/\{\{TEASER_N\}\}/g, String(TEASER_N));
  const FAQS: { q: string; a: string }[] = faqRows.length
    ? faqRows.map((f) => ({ q: sub(f.question), a: sub(f.answer) }))
    : [
        { q: 'Are these real exam questions?', a: 'No — and that\'s intentional. Tertiary Exams provides original, hand-authored practice questions modelled on each certification\'s public exam blueprint. We do not sell or distribute real exam content ("dumps"), which would violate vendor terms and undermine the value of your certification.' },
        { q: 'What is the difference between a Practice Exam and an Exam Voucher?', a: `A Practice Exam (${practicePrice}) gives you unlimited Exam mode and Practice mode attempts for one Certification. An Exam Voucher is an official, Vendor-issued code for one attempt at the real Certification exam — and it includes the same Practice Exam free, unlocked the moment you pay.` },
        { q: `How does the free ${TEASER_N}-question teaser work?`, a: `Every Practice Exam includes a free ${TEASER_N}-question teaser so you can sample the question quality and format before you buy. After signing in, you can retake the teaser as often as you like.` },
        { q: 'What is the difference between Practice mode and Exam mode?', a: 'Practice mode reveals the correct answer and full explanation after each question — ideal for studying. Exam mode is a timed simulation: no answer feedback until you submit, auto-save every 15 seconds, and auto-submit when time runs out — mirroring the real testing experience.' },
        { q: 'How do Exam Vouchers work?', a: `Buy the Exam Voucher for your Certification and its Practice Exam unlocks immediately. The official voucher code is emailed within ${VOUCHER_DELIVERY_TEXT}; redeem it with the Vendor's testing partner to book your exam date.` }
      ];
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a }
    }))
  };

  return (
    <>
      <StorefrontMotionStyles />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-br from-brand-100 via-sky-50 to-page dark:border-slate-800 dark:from-[#0a1838] dark:via-slate-950 dark:to-slate-950">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-300/30 blur-3xl motion-safe:animate-drift dark:bg-brand-500/20" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[380px] w-[380px] rounded-full bg-emerald-200/30 blur-3xl motion-safe:animate-drift motion-safe:[animation-delay:-7s] dark:bg-emerald-500/10" />
        <div className="pointer-events-none absolute inset-0 text-brand-300/50 [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_70%)] dark:text-brand-400/20">
          <DotPattern className="h-full w-full" />
        </div>
        <div className="container-app relative grid grid-cols-[minmax(0,1fr)] items-center gap-8 py-6 md:py-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3 py-1 text-xs font-semibold text-brand-700 shadow-card motion-safe:animate-fade-up dark:border-slate-700 dark:bg-slate-900/70 dark:text-brand-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {certCount}+ Certifications · Practice Exams &amp; Exam Vouchers
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight motion-safe:animate-fade-up motion-safe:[animation-delay:80ms] sm:text-5xl md:text-[3.5rem]">
              Prepare with confidence.<br />
              <span className="gradient-text">Get certified.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-600 motion-safe:animate-fade-up motion-safe:[animation-delay:160ms] dark:text-slate-300 sm:text-lg">
              Realistic timed Practice Exams for just <b className="text-ink dark:text-white">{practicePrice}</b> — and official Exam Vouchers that include the Practice Exam <b className="text-emerald-700 dark:text-emerald-300">free</b>. Start with a free {TEASER_N}-question teaser — no card needed.
            </p>
            <div className="mt-6 flex flex-col gap-3 motion-safe:animate-fade-up motion-safe:[animation-delay:240ms] sm:flex-row">
              <Link href="/practice-exams" className="btn-primary group min-h-[48px] px-6 text-base">
                <BookOpenCheck className="h-5 w-5" aria-hidden="true" /> Browse Practice Exams
              </Link>
              <Link
                href="/exam-vouchers"
                className="btn group min-h-[48px] bg-gradient-to-r from-emerald-600 to-teal-600 px-6 text-base text-white shadow-sm hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500"
              >
                <Ticket className="h-5 w-5" aria-hidden="true" /> Get an Exam Voucher
              </Link>
            </div>
            <form action="/practice-exams" className="mt-5 flex max-w-lg items-center gap-2 rounded-lg border border-brand-200 bg-white p-1.5 shadow-lift motion-safe:animate-fade-up motion-safe:[animation-delay:320ms] dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-glow">
              <Search className="ml-3 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
              <input
                name="q"
                type="search"
                aria-label="Search Practice Exams"
                placeholder="Search exams (e.g. SAA-C03, AZ-900)"
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none dark:placeholder:text-slate-500"
              />
              <button className="btn-primary min-h-[40px]">Search</button>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted motion-safe:animate-fade-up motion-safe:[animation-delay:400ms] dark:text-slate-400">
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Money-back guarantee</span>
              <span className="inline-flex items-center gap-1"><Sparkles className="h-4 w-4" aria-hidden="true" /> Exam mode + Practice mode</span>
              <span className="inline-flex items-center gap-1"><Award className="h-4 w-4" aria-hidden="true" /> Original, blueprint-aligned questions</span>
            </div>
          </div>
          <div className="min-w-0 motion-safe:animate-fade-up motion-safe:[animation-delay:200ms]">
            <HeroExamVisual />
          </div>
        </div>
      </section>

      {/* Two product categories — the centrepiece */}
      <section id="products" className="container-app py-6 md:py-8">
        <div className="mx-auto mb-6 max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Practise for it. Then go book it.</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Start with a Practice Exam, or go all in with the official Exam Voucher — your Practice Exam comes free with it.
          </p>
        </div>
        <div className="mx-auto max-w-5xl">
          <CategoryShowcase voucherFrom={voucherFrom} teaserN={TEASER_N} />
        </div>
      </section>

      {/* Popular certifications — each card shows both options */}
      <section className="border-y border-line bg-canvas dark:border-slate-800 dark:bg-slate-900/40">
        <div className="container-app py-6 md:py-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">Start with a top Certification</h2>
            </div>
            <Link href="/practice-exams" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
              View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((b) => <ProductCard key={b.id} b={b} />)}
            {popular.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No Practice Exams published yet.</p>}
          </div>
        </div>
      </section>

      {/* Vendors — gentle marquee; a static wrap under reduced motion */}
      {vendorChips.length > 0 && (
        <section className="container-app py-5 md:py-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Certifications from the names you know</h2>
            </div>
            <Link href="/vendors" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
              All Vendors <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] motion-reduce:hidden">
            <div className="flex w-max animate-marquee gap-3 py-1 group-hover:[animation-play-state:paused]">
              {[0, 1].map((copy) =>
                vendorChips.map((v) => (
                  <Link
                    key={`${copy}-${v.id}`}
                    href={`/practice-exams/${v.slug}`}
                    aria-hidden={copy === 1 ? true : undefined}
                    tabIndex={copy === 1 ? -1 : undefined}
                    className="card-hover flex min-h-[44px] shrink-0 items-center gap-2 px-4 py-2.5"
                  >
                    <span className="font-display font-bold">{v.name}</span>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted dark:text-slate-400">{v.count}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
          <div className="hidden flex-wrap gap-2 motion-reduce:flex">
            {vendorChips.map((v) => (
              <Link key={v.id} href={`/practice-exams/${v.slug}`} className="card-hover flex min-h-[44px] items-center gap-2 px-4 py-2.5">
                <span className="font-display font-bold">{v.name}</span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted dark:text-slate-400">{v.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section id="how" className="border-t border-line bg-canvas dark:border-slate-800 dark:bg-slate-900/40">
        <div className="container-app py-6 md:py-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">From first question to exam day</h2>
          </div>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { icon: MousePointerClick, t: 'Pick your Certification', d: `Search ${certCount}+ Certifications by Vendor, level or exam code.` },
              { icon: ListChecks, t: `Take the free ${TEASER_N}-question teaser`, d: 'Sample the question quality and the real test-centre screen — no card needed.' },
              { icon: Trophy, t: 'Practise, then book', d: `Buy the Practice Exam for ${practicePrice}, or the Exam Voucher with the Practice Exam included free.` }
            ].map((s, i) => (
              <li key={s.t} className="card relative p-6">
                <span className="absolute right-5 top-5 font-mono text-xs text-muted">0{i + 1}</span>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                  <s.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{s.t}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <LandingTestimonials />

      {/* FAQ */}
      <section id="faq" className="border-t border-line bg-canvas dark:border-slate-800 dark:bg-slate-900/40">
        <div className="container-app py-6 md:py-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">Frequently asked questions</h2>
          </div>

          <div className="mx-auto mt-6 max-w-3xl space-y-2">
            {FAQS.map((f, i) => (
              <details key={i} className="group rounded-xl border border-line bg-white px-5 py-3 transition hover:border-brand-200 hover:shadow-sm open:border-brand/50 open:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:open:border-blue-500/60">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-slate-900 dark:text-slate-100">
                  <span>{f.q}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180 group-open:text-blue-600 dark:group-open:text-blue-400" aria-hidden="true" />
                </summary>
                <p className="mt-2 pb-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{f.a}</p>
              </details>
            ))}
          </div>

          <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-slate-500 dark:text-slate-400">
            Still have questions? <Link href="/p/support" className="font-medium text-blue-600 hover:underline dark:text-blue-400">Contact our support team</Link> — we typically reply within one business day.
          </p>
        </div>
      </section>
    </>
  );
}
