import Link from 'next/link';
import { Timer, BookOpen, Award, BookOpenCheck, Hourglass, Library, Sparkles, ShieldCheck, RefreshCw } from 'lucide-react';
import { StartButton } from './start-attempt-button';
import { ExamDomains, ExamReferences } from '@/components/exam-domains';
import { ExamReviews } from '@/components/exam-reviews';
import { PUBLIC_SITE_URL, serializeJsonLd } from '@/lib/structured-data';
import { PRICE_TAX_NOTE, STORE_CURRENCY } from '@/lib/currency';
import { formatPrice } from '@/lib/utils';
import {
  checkoutHref, displayExamCode, practiceOnSale, voucherHref, voucherOnSale, voucherTitleFor
} from '@/lib/products';
import { Breadcrumbs, CheckList, InstructorLedCard, MobileBuyBar, StatTile, VoucherUpsell } from '@/components/product/product-parts';
import { instructorLedCourseFor } from '@/lib/instructor-led';

type BundleItem = {
  id: string;
  position: number;
  tier: string;
  exam: {
    id: string;
    slug: string;
    code: string;
    title: string;
    level: string;
    questionCount: number;
    durationMinutes: number;
    passingScore: number;
    domains: any;
    infoUrl?: string | null;
    vendor: { slug: string; name: string };
    _count?: { questions: number };
  };
};

type Bundle = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  priceVoucher: number | null;
  published: boolean;
  voucherSlug: string | null;
  voucherTitle: string | null;
  voucherPublished: boolean;
  items: BundleItem[];
};

// The Practice Exam product page for one certification: the pool exam (the
// PRACTICE item) at the flat practice price, cross-selling the Exam Voucher.
export function BundleAsExamView({ bundle, userId, owned = false }: { bundle: Bundle; userId?: string; owned?: boolean }) {
  // Prefer the PRACTICE item: the VOUCHER row points at the same exam.
  const first = (bundle.items.find((i) => i.tier === 'PRACTICE') ?? bundle.items[0])?.exam;
  if (!first) return null;
  const poolSize = first._count?.questions ?? first.questionCount;
  const perAttempt = Math.min(first.questionCount, poolSize);
  const vendor = first.vendor;
  const displayCode = displayExamCode(first.code);
  const forSale = practiceOnSale(bundle);
  const hasVoucher = voucherOnSale(bundle);
  const buyHref = checkoutHref(bundle.id, 'PRACTICE');
  const voucherBuyHref = checkoutHref(bundle.id, 'VOUCHER');
  const voucherPage = voucherHref(vendor.slug, bundle);
  const teaserAction = `/practice-exams/${vendor.slug}/${first.slug}/teaser`;
  const course = instructorLedCourseFor(bundle.slug);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${bundle.title} Practice Exam`,
    description: bundle.description,
    sku: displayCode,
    category: 'Certification practice exam',
    url: `${PUBLIC_SITE_URL}/practice-exams/${vendor.slug}/${bundle.slug}`,
    brand: { '@type': 'Brand', name: 'Tertiary Exams' },
    manufacturer: { '@type': 'Organization', name: 'Tertiary Infotech Academy Pte Ltd' },
    offers: {
      '@type': 'Offer',
      name: 'Practice Exam',
      url: `${PUBLIC_SITE_URL}${buyHref}`,
      priceCurrency: STORE_CURRENCY,
      price: (bundle.price / 100).toFixed(2),
      availability: forSale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-br from-brand-100 via-sky-50 to-page dark:border-slate-800 dark:from-[#0a1838] dark:via-slate-950 dark:to-slate-950">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-300/30 blur-3xl dark:bg-brand-500/20" aria-hidden="true" />
        <div className="container-app relative py-8 md:py-10">
          <Breadcrumbs items={[
            { href: '/practice-exams', label: 'Practice Exams' },
            { href: `/practice-exams/${vendor.slug}`, label: vendor.name },
            { label: displayCode }
          ]} />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="badge-brand">Practice Exam</span>
            <span className="badge">{vendor.name}</span>
            <span className="badge">{displayCode}</span>
            <span className="badge">{first.level}</span>
          </div>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">{bundle.title}</h1>
          <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">{bundle.description}</p>
          <div className="mt-6 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile icon={Library} label="Question pool" value={`${poolSize}`} />
            <StatTile icon={BookOpen} label="Per attempt" value={`${perAttempt} Q`} />
            <StatTile icon={Timer} label="Duration" value={`${first.durationMinutes} min`} />
            <StatTile icon={Award} label="Pass score" value={`${first.passingScore}%`} />
          </div>
        </div>
      </section>

      <div className="container-app grid gap-8 py-8 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card p-5">
              <Hourglass className="h-6 w-6 text-brand dark:text-brand-300" aria-hidden="true" />
              <h2 className="mt-3 font-semibold">Exam mode <span className="ml-1 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">Default</span></h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{first.durationMinutes}-minute timer, flag for review and a review screen before you submit — just like test day.</p>
            </div>
            <div className="card p-5">
              <BookOpenCheck className="h-6 w-6 text-brand dark:text-brand-300" aria-hidden="true" />
              <h2 className="mt-3 font-semibold">Practice mode</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">See the correct answer, the exam domain and a full explanation after every question.</p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-xl font-bold">What you get</h2>
            <div className="mt-4">
              <CheckList items={[
                `A ${poolSize}-question pool — every attempt draws ${perAttempt} fresh questions weighted by the official exam domains`,
                'Unlimited retakes, lifetime access',
                'Score report by exam domain, with your score trend over time',
                'Answer review with explanations and reference links',
                'Original, blueprint-aligned questions — never exam dumps'
              ]} />
            </div>
          </div>

          {hasVoucher && !owned && (
            <div className="lg:hidden">
              <VoucherUpsell href={voucherPage} buyHref={voucherBuyHref} price={bundle.priceVoucher!} code={displayCode} compact />
            </div>
          )}

          <ExamDomains domains={first.domains} productSlug={bundle.slug} />
          <ExamReferences productSlug={bundle.slug} fallbackExamUrl={first.infoUrl} />
          <ExamReviews examId={first.id} examTitle={bundle.title} />

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tertiary Exams provides original practice questions for learning. We are not affiliated with {vendor.name}, and we do not provide real exam dumps.
          </p>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {owned ? (
            <div className="card p-5">
              <div className="mb-1 text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">You own this practice exam</div>
              <div className="font-semibold">Start a new attempt</div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Every attempt is a fresh draw from the pool.</p>
              <div className="mt-3 flex flex-col gap-2">
                <StartButton examId={first.id} mode="EXAM" />
                <StartButton examId={first.id} mode="PRACTICE" />
              </div>
            </div>
          ) : forSale ? (
            <div className="card p-5">
              <div className="eyebrow">Practice Exam</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold text-ink dark:text-white">{formatPrice(bundle.price)}</span>
                <span className="text-sm text-muted dark:text-slate-400">one-time · lifetime access · {PRICE_TAX_NOTE}</span>
              </div>
              <div className="mt-4">
                <CheckList items={['Timed Exam mode + Practice mode', 'Unlimited fresh attempts', 'Instant access after payment']} />
              </div>
              <Link href={buyHref} className="btn-primary-grad mt-5 min-h-[44px] w-full">Buy Practice Exam</Link>
              <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-muted dark:text-slate-400">
                <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> 7-day refund</span>
                <span className="inline-flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Unlimited retakes</span>
              </div>
            </div>
          ) : (
            <div className="card p-5 text-sm text-slate-600 dark:text-slate-300">This practice exam isn&apos;t on sale right now.</div>
          )}

          <form action={teaserAction} method="post" className="card-hover block p-5">
            <button type="submit" className="w-full text-left">
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase text-brand-700 dark:text-brand-300"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Free</span>
              <span className="mt-1 block font-semibold">Try 10 questions free</span>
              <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">No credit card required.</span>
              <span className="btn-outline mt-3 w-full">Start free teaser</span>
            </button>
          </form>

          {hasVoucher && (
            <div className="hidden lg:block">
              <VoucherUpsell href={voucherPage} buyHref={voucherBuyHref} price={bundle.priceVoucher!} code={displayCode} />
            </div>
          )}
          {hasVoucher && owned && (
            <p className="text-center text-xs text-muted lg:hidden dark:text-slate-400">
              Booking the real exam? <Link href={voucherPage} className="font-medium text-brand hover:underline dark:text-brand-300">{voucherTitleFor(bundle)}</Link>
            </p>
          )}
          {course && <InstructorLedCard course={course} code={displayCode} />}
        </aside>
      </div>

      {!owned && forSale && (
        <MobileBuyBar label={`${displayCode} Practice Exam`} price={bundle.price} href={buyHref} cta="Buy now" />
      )}
    </div>
  );
}
