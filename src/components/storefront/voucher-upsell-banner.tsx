import Link from 'next/link';
import { ArrowRight, Ticket } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { PRACTICE_PRICE_CENTS } from '@/lib/products';

/** Slim cross-sell strip: book the real exam, get the practice exam free. */
export function VoucherUpsellBanner({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/exam-vouchers"
      className={`group flex flex-col gap-3 rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-sky-50 p-4 transition hover:border-emerald-300 hover:shadow-lift sm:flex-row sm:items-center sm:justify-between dark:border-emerald-500/30 dark:from-emerald-500/10 dark:via-slate-900/60 dark:to-sky-500/10 ${className}`}
    >
      <span className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
          <Ticket className="h-5 w-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block font-semibold text-ink dark:text-white">Booking the real exam?</span>
          <span className="block text-sm text-slate-600 dark:text-slate-300">
            Buy the official Exam Voucher and get the Practice Exam <b className="text-emerald-700 dark:text-emerald-300">free</b> (worth {formatPrice(PRACTICE_PRICE_CENTS)}).
          </span>
        </span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
        Browse Exam Vouchers <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
