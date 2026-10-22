import Link from 'next/link';
import { Check, ArrowRight, Mail, Sparkles, Ticket } from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatPrice, tierLabel } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ orderId?: string }>;

export default async function SuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const { orderId } = await searchParams;
  const session = await auth();
  const userId = (session?.user as any)?.id;

  let order:
    | (Awaited<ReturnType<typeof db.order.findUnique>> & {
        exam?: { title: string; code: string } | null;
        bundle?: { title: string } | null;
        billingAddress?: any;
      })
    | null = null;

  if (orderId && userId) {
    order = (await db.order.findFirst({
      where: { id: orderId, userId },
      include: {
        exam: { select: { title: true, code: true } },
        bundle: { select: { title: true } },
        billingAddress: true
      }
    })) as any;
  }

  const hasVoucher = order?.tier === 'VOUCHER' || order?.tier === 'BUNDLE' || !!order?.bundleId;
  const productName = order?.bundle?.title ?? order?.exam?.title ?? null;

  return (
    <div className="container-app max-w-xl py-20">
      <div className="card p-10 text-center">
        <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Payment successful</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          A confirmation email is on its way to your inbox.
        </p>

        {order && (
          <div className="mt-6 rounded-lg border border-slate-200 p-4 text-left text-sm dark:border-slate-700">
            <div className="grid grid-cols-2 gap-y-2">
              <div className="text-slate-500 dark:text-slate-400">Order</div>
              <div className="text-right font-mono text-xs">{order.number ?? order.id}</div>
              {productName && (
                <>
                  <div className="text-slate-500 dark:text-slate-400">Product</div>
                  <div className="text-right font-medium">{productName}</div>
                </>
              )}
              {order.tier && (
                <>
                  <div className="text-slate-500 dark:text-slate-400">Tier</div>
                  <div className="text-right">{tierLabel(order.tier)}</div>
                </>
              )}
              <div className="text-slate-500 dark:text-slate-400">Payment method</div>
              <div className="text-right">{order.provider}</div>
              <div className="text-slate-500 dark:text-slate-400">Total</div>
              <div className="text-right text-base font-semibold">{formatPrice(order.amount, order.currency)}</div>
            </div>
            {order.billingAddress && (
              <div className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <div className="mb-1 uppercase tracking-wide">Billed to</div>
                <div className="text-slate-700 dark:text-slate-300">
                  {order.billingAddress.fullName}
                  {order.billingAddress.company && <> — {order.billingAddress.company}</>}
                </div>
                <div>
                  {order.billingAddress.line1}
                  {order.billingAddress.line2 ? `, ${order.billingAddress.line2}` : ''},{' '}
                  {order.billingAddress.city}
                  {order.billingAddress.state ? `, ${order.billingAddress.state}` : ''}{' '}
                  {order.billingAddress.postalCode}, {order.billingAddress.country}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 space-y-2 rounded-lg bg-slate-50 p-4 text-left text-sm dark:bg-slate-900">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span className="text-slate-700 dark:text-slate-300">
              Practice + Exam modes are unlocked now under My Content.
            </span>
          </div>
          {hasVoucher && (
            <div className="flex items-start gap-2">
              <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="text-slate-700 dark:text-slate-300">
                Your exam voucher code arrives by email within <b>3–5 business days</b>.
              </span>
            </div>
          )}
          <div className="flex items-start gap-2">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span className="text-slate-700 dark:text-slate-300">
              Receipt sent to your registered email.
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/user-dashboard" className="btn-primary-grad inline-flex items-center justify-center gap-1">
            Go to My Content <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/practice-exams" className="btn-outline inline-flex items-center justify-center">
            Browse more exams
          </Link>
        </div>
      </div>
    </div>
  );
}
