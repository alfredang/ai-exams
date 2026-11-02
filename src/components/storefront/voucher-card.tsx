import Link from 'next/link';
import { BadgeCheck, BookOpen, Gift, Mail, ReceiptText, Ticket } from 'lucide-react';
import type { Feature } from '@/components/feature-cards';
import { Price } from '@/components/price';
import { PRICE_TAX_NOTE } from '@/lib/currency';
import { PRACTICE_PRICE_CENTS, VOUCHER_DELIVERY_TEXT, checkoutHref, displayExamCode, voucherHref, voucherTitleFor } from '@/lib/products';

// The four Exam Voucher promises shown above both voucher catalogs.
export const VOUCHER_PROMISES: Feature[] = [
  { icon: BadgeCheck, t: 'Official Exam Vouchers', d: 'Genuine Vendor-issued codes, redeemable for the real Certification exam.' },
  { icon: BookOpen, t: 'Practice Exam included', d: 'Unlimited Exam mode and Practice mode attempts unlock the moment you pay.' },
  { icon: Mail, t: 'Delivered by email', d: `Your voucher code arrives within ${VOUCHER_DELIVERY_TEXT}.` },
  { icon: ReceiptText, t: 'Tax invoice', d: 'Secure checkout and a GST tax invoice for every order.' }
];

// One Exam Voucher in a catalog grid (/exam-vouchers and /exam-vouchers/[vendor]).
export type VoucherCardData = {
  id: string;
  slug: string;
  title: string;
  priceVoucher: number | null;
  voucherSlug: string | null;
  voucherTitle: string | null;
  exam: { code: string; level: string; vendor: { name: string; slug: string } };
};

export function VoucherCard({ b, showVendor = true }: { b: VoucherCardData; showVendor?: boolean }) {
  const { exam } = b;
  const productHref = voucherHref(exam.vendor.slug, b);
  return (
    <article className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lift dark:hover:border-emerald-500/40 dark:hover:shadow-glow">
      <div aria-hidden="true" className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 opacity-70 transition group-hover:opacity-100" />
      <div className="flex flex-1 flex-col p-5">
        <div className="eyebrow mb-2 flex flex-wrap items-center gap-x-1.5 text-[11px]">
          {showVendor && <><span>{exam.vendor.name}</span><span aria-hidden="true">·</span></>}
          <span>{displayExamCode(exam.code)}</span>
          <span aria-hidden="true">·</span><span>{exam.level}</span>
        </div>
        <h3 className="font-display text-lg font-bold leading-snug">
          <Link href={productHref} className="hover:text-emerald-700 dark:hover:text-emerald-300">{voucherTitleFor(b)}</Link>
        </h3>
        <ul className="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
          <li className="flex gap-2"><Ticket className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />Official voucher, emailed in {VOUCHER_DELIVERY_TEXT}</li>
          <li className="flex gap-2">
            <Gift className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
            <span>Practice Exam included <b className="text-emerald-700 dark:text-emerald-300">FREE</b> (worth <Price cents={PRACTICE_PRICE_CENTS} />)</span>
          </li>
        </ul>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Voucher</div>
            <div className="font-display text-2xl font-extrabold text-emerald-700 dark:text-emerald-300"><Price cents={b.priceVoucher!} /></div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">{PRICE_TAX_NOTE}</div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={productHref} className="btn-ghost min-h-[44px] text-sm">Details</Link>
            <Link
              href={checkoutHref(b.id, 'VOUCHER')}
              className="btn min-h-[44px] bg-gradient-to-r from-emerald-600 to-teal-600 text-sm text-white shadow-sm hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500"
            >
              Buy voucher
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
