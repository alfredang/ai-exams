import Link from 'next/link';
import { Price } from '@/components/price';
import { db } from '@/lib/db';
import { PRICE_TAX_NOTE } from '@/lib/currency';
import { ShoppingCart, Ticket } from 'lucide-react';
import { checkoutHref, voucherOnSale } from '@/lib/products';

/**
 * Purchase card for an exam page. Every certification sells one practice
 * exam two ways: practice exam only, or the real exam voucher with the
 * practice exam included. (The prices live on the product's Bundle row.)
 */
export async function ExamBundleCTA({ examId }: { examId: string }) {
  const product = await db.bundle.findFirst({
    where: { published: true, items: { some: { examId } } },
    orderBy: [{ price: 'asc' }, { title: 'asc' }],
    select: { id: true, price: true, priceVoucher: true, published: true, voucherPublished: true }
  });

  if (!product) {
    return (
      <div className="card p-5">
        <div className="text-xs font-semibold uppercase text-slate-500">Purchase</div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          This exam isn't on sale yet. Try the free teaser in the meantime.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-purple-700 dark:text-purple-300">
        <ShoppingCart className="h-3.5 w-3.5" />
        Buy
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-300">Unlimited retakes, each drawn fresh from the question pool.</p>
      <div className="mt-3 space-y-2">
        <Link href={checkoutHref(product.id, 'PRACTICE')} className="btn-secondary w-full">
          Practice exam · <Price cents={product.price} />
        </Link>
        {voucherOnSale(product) && (
          <Link
            href={checkoutHref(product.id, 'VOUCHER')}
            className="btn-primary-grad inline-flex w-full items-center justify-center gap-1.5"
          >
            <Ticket className="h-3.5 w-3.5" />
            Exam voucher + practice exam · <Price cents={product.priceVoucher!} />
          </Link>
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-300">Prices are {PRICE_TAX_NOTE}</p>
      {voucherOnSale(product) && (
        <p className="mt-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-300">
          Practice access is immediate; voucher codes arrive by email within 3–5 business days. The voucher portion is non-refundable after issue. <Link href="/p/refund-policy" className="text-blue-600 underline dark:text-blue-300">Refund details</Link>
        </p>
      )}
    </div>
  );
}
