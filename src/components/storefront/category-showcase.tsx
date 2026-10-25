import Link from 'next/link';
import { ArrowRight, BadgeCheck, BookOpenCheck, Check, Gift, Ticket } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { PRICE_TAX_NOTE } from '@/lib/currency';
import { PRACTICE_PRICE_CENTS, VOUCHER_DELIVERY_TEXT } from '@/lib/products';

/**
 * The homepage centrepiece: the two product categories side by side.
 * Exam Vouchers is the highlighted "Best value" card.
 */
export function CategoryShowcase({ voucherFrom, teaserN }: { voucherFrom: number | null; teaserN: number }) {
  const practice = formatPrice(PRACTICE_PRICE_CENTS);
  return (
    <div className="grid items-stretch gap-5 md:grid-cols-2 lg:gap-8">
      {/* Practice Exams */}
      <div className="card flex flex-col p-6 sm:p-8 motion-safe:animate-fade-up">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          <BookOpenCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-extrabold tracking-tight">Practice Exams</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Prepare until you’re ready — on your own schedule.</p>
        <div className="mt-5 flex items-baseline gap-2">
          <span className="font-display text-4xl font-extrabold text-brand-700 dark:text-brand-300">{practice}</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">per Certification · one-time · {PRICE_TAX_NOTE}</span>
        </div>
        <ul className="mt-6 space-y-3 text-sm">
          {[
            'Timed Exam mode that looks and feels like test day',
            'Practice mode with an explanation after every question',
            'Unlimited retakes — a fresh draw by exam domain each time'
          ].map((t) => (
            <li key={t} className="flex gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden="true" />
              <span className="text-slate-700 dark:text-slate-200">{t}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-8">
          <Link href="/practice-exams" className="btn-outline group min-h-[48px] w-full text-base">
            Browse Practice Exams <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
            Not sure yet? Start with the free {teaserN}-question teaser.
          </p>
        </div>
      </div>

      {/* Exam Vouchers — highlighted */}
      <div className="te-glow-border relative rounded-xl p-[2px] shadow-lift motion-safe:animate-fade-up motion-safe:[animation-delay:120ms] dark:shadow-glow">
        <span className="te-shimmer absolute -top-3 right-6 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Best value
        </span>
        <div className="flex h-full flex-col rounded-[10px] bg-white p-6 sm:p-8 dark:bg-slate-900">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <Ticket className="h-6 w-6" aria-hidden="true" />
          </span>
          <h3 className="mt-5 font-display text-2xl font-extrabold tracking-tight">Exam Vouchers</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Book the real exam — and prepare for it free.</p>
          <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {voucherFrom != null && (
              <>
                <span className="text-sm text-slate-500 dark:text-slate-400">from</span>
                <span className="font-display text-4xl font-extrabold text-emerald-700 dark:text-emerald-300">{formatPrice(voucherFrom)}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{PRICE_TAX_NOTE}</span>
              </>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
              <Gift className="h-3.5 w-3.5" aria-hidden="true" /> Practice Exam FREE (worth {practice})
            </span>
          </div>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              'Official Vendor-issued voucher for the real Certification exam',
              'The Practice Exam unlocks the moment you pay — at no extra cost',
              `Voucher emailed within ${VOUCHER_DELIVERY_TEXT}, with a GST tax invoice`
            ].map((t) => (
              <li key={t} className="flex gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                <span className="text-slate-700 dark:text-slate-200">{t}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-8">
            <Link
              href="/exam-vouchers"
              className="btn group min-h-[48px] w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-base text-white shadow-sm hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500"
            >
              Get an Exam Voucher <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
              Redeem it with the Vendor’s testing partner and book your date when you’re ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
