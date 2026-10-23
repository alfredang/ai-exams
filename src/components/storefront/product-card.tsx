import Link from 'next/link';
import { ArrowRight, BookOpenCheck, Library, Ticket } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { poolCardLabel } from '@/lib/bundle-contents';
import { displayExamCode, practiceHref, voucherHref, voucherOnSale } from '@/lib/products';
import { HighlightedText } from './highlighted-text';

export type ProductCardData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  priceVoucher: number | null;
  published: boolean;
  voucherSlug: string | null;
  voucherPublished: boolean;
  items: {
    tier: string;
    exam: {
      id: string;
      code: string;
      level: string;
      questionCount: number;
      vendor: { slug: string; name: string };
      _count?: { questions: number };
    };
  }[];
};

/**
 * One certification on the storefront: its Practice Exam (title links to the
 * practice page) with both ways to buy underneath — Practice Exam at the flat
 * price, and the Exam Voucher (practice exam included) when it's on sale.
 */
export function ProductCard({ b, query = '', showVendor = true }: { b: ProductCardData; query?: string; showVendor?: boolean }) {
  const exam = (b.items.find((i) => i.tier === 'PRACTICE') ?? b.items[0])?.exam;
  if (!exam) return null;
  const vendor = exam.vendor;
  const code = displayExamCode(exam.code);
  const pHref = practiceHref(vendor.slug, b);
  const hasVoucher = voucherOnSale(b);
  const pool = poolCardLabel(b.items);

  return (
    <article className="card group relative flex flex-1 flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift dark:hover:border-brand-400/50 dark:hover:shadow-glow">
      <div aria-hidden="true" className="h-1 bg-gradient-to-r from-brand via-indigo-500 to-sky-400 opacity-70 transition group-hover:opacity-100" />
      <div className="flex flex-1 flex-col p-5">
        <div className="eyebrow mb-2 flex flex-wrap items-center gap-x-1.5 text-[11px]">
          {showVendor && (
            <>
              <span><HighlightedText text={vendor.name} query={query} /></span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span><HighlightedText text={code} query={query} /></span>
          <span aria-hidden="true">·</span>
          <span>{exam.level}</span>
        </div>
        <h3 className="font-display text-lg font-bold leading-snug">
          <Link href={pHref} className="hover:text-brand-700 dark:hover:text-brand-300">
            <HighlightedText text={b.title} query={query} />
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{b.description}</p>
        {pool && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Library className="h-3.5 w-3.5" aria-hidden="true" />
            {pool}
          </p>
        )}

        <div className="mt-auto space-y-2 pt-4">
          {b.published && (
            <Link
              href={pHref}
              className="flex min-h-[44px] items-center justify-between gap-3 rounded-md border border-line bg-white px-3 py-2 text-sm transition hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-brand-400/60 dark:hover:bg-slate-800"
            >
              <span className="inline-flex items-center gap-2 font-medium text-ink dark:text-slate-100">
                <BookOpenCheck className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden="true" />
                Practice Exam
              </span>
              <span className="font-display font-bold text-brand-700 dark:text-brand-300">{formatPrice(b.price)}</span>
            </Link>
          )}
          {hasVoucher && (
            <Link
              href={voucherHref(vendor.slug, b)}
              className="flex min-h-[44px] items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-sm transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/15"
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <Ticket className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block font-medium text-emerald-900 dark:text-emerald-100">Exam Voucher</span>
                  <span className="block text-[11px] text-emerald-800/80 dark:text-emerald-200/80">+ Practice Exam free</span>
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 font-display font-bold text-emerald-700 dark:text-emerald-300">
                {formatPrice(b.priceVoucher!)}
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
