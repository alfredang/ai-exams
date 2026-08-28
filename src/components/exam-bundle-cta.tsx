import Link from 'next/link';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { practiceExamCount, practiceExamLabel } from '@/lib/bundle-contents';
import { Package, Ticket } from 'lucide-react';

/**
 * Renders one or more "Buy in bundle" cards for the bundles that include
 * this exam. The app sells bundles exclusively — individual exams are
 * content-only — so this is the lone purchase entry point on an exam page.
 */
export async function ExamBundleCTA({ examId }: { examId: string }) {
  const bundles = await db.bundle.findMany({
    where: {
      published: true,
      items: { some: { examId } }
    },
    orderBy: [{ price: 'asc' }, { title: 'asc' }],
    include: {
      // Not `_count: { items: true }`: that counts the VOUCHER item too, which
      // points back at the same -p1 exam and is not a practice exam the buyer
      // gets. Select the items and count the PRACTICE ones. See bundle-contents.ts.
      items: { select: { tier: true, exam: { select: { id: true, questionCount: true } } } }
    }
  });

  if (bundles.length === 0) {
    return (
      <div className="card p-5">
        <div className="text-xs font-semibold uppercase text-slate-500">Purchase</div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          This exam isn't yet available in a bundle. Try the free teaser while we package it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bundles.map((b) => (
        <div key={b.id} className="card p-5">
          <div className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-purple-700 dark:text-purple-300">
            <Package className="h-3.5 w-3.5" />
            Bundle
          </div>
          <div className="font-semibold">{b.title}</div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
            Includes {practiceExamLabel(practiceExamCount(b.items))}.
          </p>
          <div className="mt-3 space-y-2">
            <Link
              href={`/checkout/bundle/${b.id}?tier=PRACTICE`}
              className="btn-secondary w-full"
            >
              Practice access · {formatPrice(b.price)}
            </Link>
            {b.priceVoucher != null && (
              <Link
                href={`/checkout/bundle/${b.id}?tier=VOUCHER`}
                className="btn-primary-grad inline-flex w-full items-center justify-center gap-1.5"
              >
                <Ticket className="h-3.5 w-3.5" />
                Practice + Exam voucher · {formatPrice(b.priceVoucher)}
              </Link>
            )}
          </div>
          {b.priceVoucher != null && (
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-300">
              Practice access is immediate; voucher codes arrive by email within 3–5 business days. The voucher portion is non-refundable after issue. <Link href="/p/refund-policy" className="text-blue-600 underline dark:text-blue-300">Refund details</Link>
            </p>
          )}
          <Link
            href={`/bundles/${b.slug}`}
            className="mt-2 inline-block text-[11px] text-blue-600 hover:underline dark:text-blue-300"
          >
            See full bundle details →
          </Link>
        </div>
      ))}
    </div>
  );
}
