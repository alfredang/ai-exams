import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { DotPattern } from '@/components/dot-pattern';
import { Search, ShieldCheck, Sparkles, BookOpen, BadgeCheck, Award, ChevronDown, HelpCircle } from 'lucide-react';
import { LandingTestimonials } from '@/components/landing-testimonials';
import { practiceExamCount, practiceExamLabel, practiceQuestionTotal } from '@/lib/bundle-contents';
import { serializeJsonLd } from '@/lib/structured-data';

// ISR: refetch vendor + popular-bundle counts at most once every 5 minutes.
// Avoids per-visit DB hits while keeping seed/publish changes visible quickly.
export const revalidate = 300;

export default async function HomePage() {
  const { getTeaserSize } = await import('@/lib/settings');
  const TEASER_N = await getTeaserSize();
  // Vendor card counts include BOTH standalone published exams AND bundles
  // attributed to the vendor (via the first bundle item's exam vendor).
  // That matches what users actually see on /practice-exams/[vendor].
  const vendors = await db.vendor.findMany({
    include: { _count: { select: { exams: { where: { published: true, deletedAt: null, questions: { some: { status: 'PUBLISHED' } } } } } } },
    take: 12
  });
  const allBundlesForCounts = await db.bundle.findMany({
    where: { published: true },
    select: { id: true, items: { take: 1, select: { exam: { select: { vendor: { select: { slug: true } } } } } } }
  });
  const bundleCountByVendor = new Map<string, number>();
  for (const b of allBundlesForCounts) {
    const vs = b.items[0]?.exam.vendor.slug;
    if (vs) bundleCountByVendor.set(vs, (bundleCountByVendor.get(vs) || 0) + 1);
  }

  // Popular section lists recent published bundles only — bundles are the
  // sole purchase entry point in the app.
  const recentBundles = await db.bundle.findMany({
    where: { published: true },
    include: {
      items: { orderBy: { position: 'asc' }, include: { exam: { include: { vendor: true } } } }
    },
    take: 6,
    orderBy: { createdAt: 'desc' }
  });

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
        { q: 'How does the free teaser work?', a: `Every exam includes a free ${TEASER_N}-question teaser so you can sample the question quality and format before you buy. After signing in, you can retake the teaser as often as you like — there's no per-attempt limit.` },
        { q: 'What is the difference between Practice Mode and Exam Mode?', a: 'Practice Mode reveals the correct answer and full explanation after each question — ideal for studying and reinforcing concepts. Exam Mode is a timed simulation: no answer feedback until you submit, auto-save every 15 seconds, and auto-submit when time runs out — mirroring the real testing experience.' },
        { q: 'How do exam vouchers work?', a: 'Purchasing the Exam Voucher tier includes a real, vendor-issued voucher code (delivered by email within 3–5 business days) PLUS lifetime practice access to the same certification at no additional cost. Use the code to register for your official exam at the vendor\'s testing partner.' }
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-1/2 text-blue-200/40 md:block dark:text-blue-400/15 md:dark:hidden">
          <DotPattern className="h-full w-full" />
        </div>
        <div className="container-app relative grid gap-10 pb-6 pt-4 md:grid-cols-2 md:pb-10 md:pt-6">
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Practice Smarter <br />for Your <span className="gradient-text">Next Certification</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">
              Realistic practice exams across AWS, Microsoft, Cisco, CompTIA, Google Cloud and more. Try {TEASER_N} questions for free on any exam.
            </p>
            <form action="/practice-exams" className="mt-8 flex max-w-lg items-center gap-2 rounded-full border border-slate-200 bg-white p-1.5 shadow-card dark:border-slate-700 dark:bg-slate-900">
              <Search className="ml-3 h-5 w-5 text-slate-400" />
              <input
                name="q"
                type="search"
                aria-label="Search certification practice exams"
                placeholder="Search exams (e.g. SAA-C03, AZ-900)"
                className="flex-1 bg-transparent px-2 py-2 text-sm outline-none dark:placeholder:text-slate-500"
              />
              <button className="btn-primary-grad rounded-full">Search</button>
            </form>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Money-back guarantee</span>
              <span className="inline-flex items-center gap-1"><Sparkles className="h-4 w-4" /> Exam Mode</span>
              <span className="inline-flex items-center gap-1"><Sparkles className="h-4 w-4" /> Practice Mode</span>
              <span className="inline-flex items-center gap-1"><Award className="h-4 w-4" /> 100+ certifications</span>
            </div>
          </div>
          <div className="relative hidden items-center justify-center md:flex">
            <Image
              src="/hero.webp"
              alt="Online exam preparation with instructor-led learning"
              width={1200}
              height={897}
              priority
              sizes="(min-width: 1024px) 600px, (min-width: 768px) 480px, 100vw"
              className="h-auto max-h-[480px] w-full max-w-full object-contain dark:brightness-90 dark:[mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_85%)] dark:[-webkit-mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_85%)]"
            />
          </div>
        </div>
      </section>

      {/* Vendors */}
      <section className="container-app py-8">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Browse by vendor</h2>
          <Link href="/vendors" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {vendors.map(v => {
            const total = v._count.exams + (bundleCountByVendor.get(v.slug) || 0);
            return (
              <Link key={v.id} href={`/practice-exams/${v.slug}`} className="card-hover flex flex-col items-center justify-center px-4 py-6 text-center">
                <div className="text-sm font-medium">{v.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{total} exam{total === 1 ? '' : 's'}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular bundles — the only thing the app sells. */}
      <section className="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <div className="container-app py-14">
          <h2 className="mb-6 text-2xl font-semibold">Popular Bundled Exams</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentBundles.map((b) => {
              const first = b.items[0]?.exam;
              const totalQs = practiceQuestionTotal(b.items);
              const examCount = practiceExamCount(b.items);
              // Strip the per-variant suffix from the code chip — the cards
              // represent the whole bundle, not the first variant, so showing
              // e.g. "SOA-C03-P1" misleads users into thinking they're
              // browsing a single variant. Mirrors the convention used in
              // [bundle-as-exam-view](src/app/practice-exams/[vendor]/[slug]/bundle-as-exam-view.tsx).
              const displayCode = first?.code.replace(/-P\d+$/i, '');
              // Link to the unified `/practice-exams/[vendor]/[slug]` route
              // (which renders BundleAsExamView with PICK A PLAN) instead of
              // the legacy `/bundles/[slug]` page. Keeps the URL surface
              // consistent with the catalog and the vendor pages.
              const bundleHref = first
                ? `/practice-exams/${first.vendor.slug}/${b.slug}`
                : `/bundles/${b.slug}`;
              return (
                <Link key={b.id} href={bundleHref} className="card-hover p-5">
                  <div className="mb-2 flex items-center gap-2 text-xs">
                    {first && <span className="badge">{first.vendor.name}</span>}
                    {displayCode && <span className="badge">{displayCode}</span>}
                    {first && <span className="badge">{first.level}</span>}
                  </div>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{b.description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{totalQs} questions · {practiceExamLabel(examCount)}</span>
                    <span className="font-semibold text-blue-700 dark:text-blue-400">{b.price === 0 ? 'Free' : `from ${formatPrice(b.price)}`}</span>
                  </div>
                </Link>
              );
            })}
            {recentBundles.length === 0 && <p className="text-sm text-slate-500">No bundled exams published yet.</p>}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container-app py-16">
        <h2 className="text-center text-2xl font-semibold">How it works</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { icon: BookOpen, t: 'Choose an exam', d: 'Pick from 100+ vendors and certifications.' },
            { icon: Sparkles, t: `Try ${TEASER_N} questions free`, d: 'Get a feel for our practice content before you buy.' },
            { icon: BadgeCheck, t: 'Pass with confidence', d: 'Practice + Exam modes simulate the real test.' }
          ].map((s, i) => (
            <div key={i} className="card p-6 text-center">
              <s.icon className="mx-auto h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h3 className="mt-3 font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <div className="container-app py-16">
          <h2 className="text-center text-2xl font-semibold">Three ways to prepare</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { t: `Try ${TEASER_N} questions for free`, d: 'Free teaser on every exam — no credit card required. Get a feel for our content before you buy.', cta: 'Browse exams' },
              { t: 'Practice Exam', d: 'Full access to the practice question bank with detailed explanations. Practice Mode and Exam Mode included.', cta: 'Browse' },
              { t: 'Exam Voucher (practice included)', d: 'A real exam voucher PLUS full practice access for the same exam — no separate practice purchase needed.', cta: 'Browse' }
            ].map((p, i) => (
              <div key={i} className="card p-6">
                <h3 className="font-semibold">{p.t}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{p.d}</p>
                <Link href="/practice-exams" className="btn-outline mt-4 w-full">{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingTestimonials />

      {/* FAQ */}
      <section id="faq" className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <div className="container-app py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <HelpCircle className="h-3.5 w-3.5" />
              FAQ
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Frequently asked questions</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Quick answers to common questions about how Tertiary Exams works.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {FAQS.map((f, i) => (
              <details key={i} className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm open:border-blue-300 open:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:open:border-blue-500/60">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold text-slate-900 dark:text-slate-100">
                  <span>{f.q}</span>
                  <ChevronDown className="mt-0.5 h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180 group-open:text-blue-600 dark:group-open:text-blue-400" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{f.a}</p>
              </details>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-3xl text-center text-sm text-slate-500 dark:text-slate-400">
            Still have questions? <a href="/p/support" className="font-medium text-blue-600 hover:underline dark:text-blue-400">Contact our support team</a> — we typically reply within one business day.
          </p>
        </div>
      </section>
    </>
  );
}
