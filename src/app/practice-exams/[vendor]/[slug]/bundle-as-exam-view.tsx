import Link from 'next/link';
import { Check, Timer, BookOpen, Award, BookOpenCheck, Hourglass } from 'lucide-react';
import { BundleBuyForm } from './bundle-buy-form';
import { StartButton } from './start-attempt-button';
import { ExamDomains, ExamReferences } from '@/components/exam-domains';
import { PUBLIC_SITE_URL, serializeJsonLd } from '@/lib/structured-data';
import { STORE_CURRENCY } from '@/lib/currency';

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
  items: BundleItem[];
};

// The product page for one certification: ONE practice exam (the pool exam,
// i.e. the PRACTICE item) sold as practice-only or with the real exam voucher.
export function BundleAsExamView({ bundle, userId, owned = false }: { bundle: Bundle; userId?: string; owned?: boolean }) {
  // Prefer the PRACTICE item: `items` has no guaranteed order, and the
  // VOUCHER row points at the same exam.
  const first = (bundle.items.find((i) => i.tier === 'PRACTICE') ?? bundle.items[0])?.exam;
  if (!first) return null;
  const poolSize = first._count?.questions ?? first.questionCount;
  const perAttempt = Math.min(first.questionCount, poolSize);
  const vendor = first.vendor;
  // Display code without per-exam suffix, e.g. "AI-900-P1" -> "AI-900"
  const displayCode = first.code.replace(/-P\d+$/, '');

  // Practice exam only, or the real exam voucher with the practice exam
  // included. The voucher option shows only when a voucher price is set.
  const tierOptions: { tier: 'PRACTICE' | 'VOUCHER'; label: string; price: number }[] = [
    { tier: 'PRACTICE', label: 'Practice Exam', price: bundle.price }
  ];
  if (bundle.priceVoucher != null) {
    tierOptions.push({ tier: 'VOUCHER', label: 'Exam Voucher (practice exam included)', price: bundle.priceVoucher });
  }
  const productUrl = `${PUBLIC_SITE_URL}/practice-exams/${vendor.slug}/${bundle.slug}`;
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: bundle.title,
    description: bundle.description,
    sku: displayCode,
    category: 'Certification practice exam',
    url: productUrl,
    brand: { '@type': 'Brand', name: 'Tertiary Exams' },
    manufacturer: { '@type': 'Organization', name: 'Tertiary Infotech Academy Pte Ltd' },
    offers: tierOptions.map((option) => ({
      '@type': 'Offer',
      name: option.label,
      url: `${PUBLIC_SITE_URL}/checkout/bundle/${bundle.id}?tier=${option.tier}`,
      priceCurrency: STORE_CURRENCY,
      price: (option.price / 100).toFixed(2),
      availability: 'https://schema.org/InStock'
    }))
  };

  return (
    <div className="container-app py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd) }} />
      <div className="mb-2 text-sm">
        <Link href="/practice-exams" className="text-blue-600 hover:underline">All exams</Link>
        <span className="text-slate-400"> / </span>
        <Link href={`/practice-exams/${vendor.slug}`} className="text-blue-600 hover:underline">{vendor.name}</Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center gap-2 text-sm">
            <span className="badge-brand">{vendor.name}</span>
            <span className="badge">{displayCode}</span>
            <span className="badge">{first.level}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{bundle.title}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-100">{bundle.description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Stat icon={BookOpen} label="Questions per attempt" value={`${perAttempt}`} />
            <Stat icon={Timer} label="Duration" value={`${first.durationMinutes} min`} />
            <Stat icon={Award} label="Pass score" value={`${first.passingScore}%`} />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="card p-5">
              <Hourglass className="h-6 w-6 text-blue-600" />
              <h3 className="mt-3 font-semibold">Exam mode <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">Default</span></h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-100">{first.durationMinutes}-minute timer, no answer reveal until you submit. Auto-saves and auto-submits — like the real exam.</p>
            </div>
            <div className="card p-5">
              <BookOpenCheck className="h-6 w-6 text-blue-600" />
              <h3 className="mt-3 font-semibold">Practice mode</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-100">See the correct answer and full explanation immediately after each question. Best for studying.</p>
            </div>
          </div>

          <ExamDomains domains={first.domains} productSlug={bundle.slug} />

          <div className="mt-6 card p-6">
            <h2 className="font-semibold">What you get</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-100">
              {[
                `A ${poolSize}-question pool — every attempt draws ${perAttempt} fresh questions weighted by the official exam domains`,
                'Unlimited retakes',
                'Results broken down by exam domain, with the domain shown on every answer',
                'Practice mode with immediate explanations',
                'Timed Exam mode that simulates the real test',
                'Mark questions for review and filter by status',
                'Original questions — never real exam dumps'
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-blue-600" /> {f}</li>
              ))}
            </ul>
          </div>


          <ExamReferences productSlug={bundle.slug} fallbackExamUrl={first.infoUrl} />

          <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
            This platform provides original practice questions for learning. We are not affiliated with {vendor.name}, and we do not provide real exam dumps.
          </p>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h3 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-300">2026 Practice Exam Details</h3>
            <dl className="mt-3 space-y-1 text-sm">
              <Row k="Exam code" v={displayCode} />
              <Row k="Level" v={first.level} />
              <Row k="Duration" v={`${first.durationMinutes} min`} />
              <Row k="Pass score" v={`${first.passingScore}%`} />
              <Row k="Question count" v={`${first.questionCount}`} />
            </dl>
          </div>

          {/* Teaser CTA is shown to everyone — anonymous AND signed-in.
              Previously hidden for signed-in users (Teaser-audit M4) on the
              concern that it created a junk teaser attempt under their
              account. We accept that trade-off: signed-in users still want to
              sample before buying, and the teaser route already creates the
              attempt under their userId (not as a guest), so it shows in
              their history correctly tagged isTeaser=true. */}
          <form action={`/practice-exams/${vendor.slug}/${first.slug}/teaser`} method="post" className="card-hover block p-5">
            <button type="submit" className="w-full text-left">
              <span className="mb-1 block text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">Free</span>
              <span className="block font-semibold">Try our free practice teaser</span>
              <span className="mt-1 block text-sm text-slate-600 dark:text-slate-100">No credit card required.</span>
              <span className="btn-outline mt-3 w-full">Start free practice exam</span>
            </button>
          </form>

          {owned && (
            <div className="card p-5">
              <div className="mb-1 text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">You have access</div>
              <div className="font-semibold">Start a new attempt</div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-100">Every attempt is a fresh draw from the pool.</p>
              <div className="mt-3 flex flex-col gap-2">
                <StartButton examId={first.id} mode="EXAM" />
                <StartButton examId={first.id} mode="PRACTICE" />
              </div>
            </div>
          )}

          {!owned && <BundleBuyForm
            bundleId={bundle.id}
            bundleSlug={bundle.slug}
            vendorSlug={vendor.slug}
            options={tierOptions}
            isSignedIn={!!userId}
          />}
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <Icon className="h-5 w-5 text-blue-600" />
      <div>
        <div className="text-xs text-slate-500 dark:text-slate-300">{label}</div>
        <div className="font-semibold">{value}</div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-300">{k}</dt><dd className="font-medium">{v}</dd></div>;
}
