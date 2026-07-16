import Link from 'next/link';
import { Check, Timer, BookOpen, Award, BookOpenCheck, Hourglass } from 'lucide-react';
import { BundleBuyForm } from './bundle-buy-form';
import { practiceItems, practiceQuestionTotal } from '@/lib/bundle-contents';

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
    vendor: { slug: string; name: string };
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

export function BundleAsExamView({ bundle, userId }: { bundle: Bundle; userId?: string }) {
  // PRACTICE items only. The VOUCHER item points back at the same -p1 exam, so
  // counting raw items claimed an extra practice exam and double-counted its
  // questions — while the copy below says "unique questions". See bundle-contents.ts.
  const practice = practiceItems(bundle.items);
  const totalQuestions = practiceQuestionTotal(bundle.items);
  // All items in a bundle share the same underlying cert (e.g. AI-900), so we
  // derive vendor/code/level/stats from the first one. Prefer the first PRACTICE
  // item: `items` has no guaranteed order here, so items[0] could be the VOUCHER
  // row. It points at the same exam today, but relying on that is a trap.
  const first = (practice[0] ?? bundle.items[0])?.exam;
  if (!first) return null;
  const vendor = first.vendor;
  const domains = (first.domains as any[]) || [];
  // Display code without per-exam suffix, e.g. "AI-900-P1" -> "AI-900"
  const displayCode = first.code.replace(/-P\d+$/, '');

  // Practice tier sells all PRACTICE items; Voucher tier adds the bundle's
  // VOUCHER item (real exam voucher). Only show Voucher option when the
  // bundle is configured with a voucher price.
  const tierOptions: { tier: 'PRACTICE' | 'VOUCHER'; label: string; price: number }[] = [
    { tier: 'PRACTICE', label: 'Practice Exam', price: bundle.price }
  ];
  if (bundle.priceVoucher != null) {
    tierOptions.push({ tier: 'VOUCHER', label: 'Exam Voucher (practice exams included)', price: bundle.priceVoucher });
  }

  return (
    <div className="container-app py-10">
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
            <Stat icon={BookOpen} label="Questions" value={`${first.questionCount}`} />
            <Stat icon={Timer} label="Duration" value={`${first.durationMinutes} min`} />
            <Stat icon={Award} label="Pass score" value={`${first.passingScore}%`} />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="card p-5">
              <BookOpenCheck className="h-6 w-6 text-blue-600" />
              <h3 className="mt-3 font-semibold">Practice mode</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-100">See the correct answer and full explanation immediately after each question. Best for studying.</p>
            </div>
            <div className="card p-5">
              <Hourglass className="h-6 w-6 text-blue-600" />
              <h3 className="mt-3 font-semibold">Exam mode</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-100">{first.durationMinutes}-minute timer, no answer reveal until you submit. Auto-saves and auto-submits — like the real exam.</p>
            </div>
          </div>

          {domains.length > 0 && (
            <div className="mt-8 card p-6">
              <h2 className="font-semibold">Domains covered</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {domains.map((d, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-100">{d.name}</span>
                    <span className="text-slate-500 dark:text-slate-300">{d.weight}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 card p-6">
            <h2 className="font-semibold">What you get</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-100">
              {[
                `Includes ${practice.length} full practice exam${practice.length === 1 ? '' : 's'} (${totalQuestions} unique questions${practice.length === 1 ? '' : ' across all sets'})`,
                'Practice mode with immediate explanations',
                'Timed Exam mode that simulates the real test',
                'Mark questions for review and filter by status',
                'Per-domain breakdown after each attempt',
                'Original questions — never real exam dumps'
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-blue-600" /> {f}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6 card p-6">
            <h2 className="font-semibold">Practice exams included</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {practice.map((item, i) => (
                <li key={item.id} className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 last:border-0 last:pb-0 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                      {i + 1}
                    </span>
                    <span className="text-slate-700 dark:text-slate-100">Practice Exam {i + 1}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-300">{item.exam.questionCount} questions · {item.exam.durationMinutes} min</span>
                </li>
              ))}
            </ul>
          </div>

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
          <Link href={`/practice-exams/${vendor.slug}/${first.slug}/teaser`} className="card-hover block p-5">
            <div className="mb-1 text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">Free</div>
            <div className="font-semibold">Try our free practice teaser</div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-100">No credit card required.</p>
            <div className="btn-outline mt-3 w-full">Start free practice exam</div>
          </Link>

          <BundleBuyForm
            bundleId={bundle.id}
            bundleSlug={bundle.slug}
            vendorSlug={vendor.slug}
            options={tierOptions}
            isSignedIn={!!userId}
          />
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
