import { Suspense } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { PUBLISHED_QUESTION_COUNT } from '@/lib/bundle-contents';
import { BundleCheckoutClient } from './bundle-checkout-client';
import { TestPaymentButton } from '@/components/test-payment-button';
import { Check, Ticket, Zap, ArrowLeft } from 'lucide-react';

export default async function BundleCheckoutPage({
  params,
  searchParams
}: {
  params: Promise<{ bundleId: string }>;
  searchParams: Promise<{ tier?: string }>;
}) {
  const { bundleId } = await params;
  const sp = await searchParams;
  const session = await auth();
  const tierQuery = sp.tier === 'VOUCHER' ? `?tier=VOUCHER` : '';
  // Encode the inner URL so its `?tier=…` doesn't break the outer `?next=…`
  // query-string parsing on the login page.
  if (!session?.user) redirect(`/login?next=${encodeURIComponent(`/checkout/bundle/${bundleId}${tierQuery}`)}`);

  const bundle = await db.bundle.findUnique({
    where: { id: bundleId },
    include: { items: { orderBy: { position: 'asc' }, include: { exam: { include: { vendor: true, ...PUBLISHED_QUESTION_COUNT } } } } }
  });
  if (!bundle || !bundle.published) notFound();

  const tier: 'PRACTICE' | 'VOUCHER' =
    sp.tier === 'VOUCHER' && bundle.priceVoucher != null ? 'VOUCHER' : 'PRACTICE';
  const amount = tier === 'VOUCHER' ? bundle.priceVoucher! : bundle.price;
  // One practice exam per product; the voucher tier includes it.
  const practiceExam = (bundle.items.find(i => i.tier === 'PRACTICE') ?? bundle.items[0])?.exam;
  const hasVoucher = tier === 'VOUCHER';
  const vendor = practiceExam?.vendor;
  const firstCode = practiceExam?.code.replace(/-P\d+$/, '');
  const poolSize = practiceExam?._count.questions ?? 0;
  const perAttempt = practiceExam ? Math.min(practiceExam.questionCount, poolSize) : 0;

  return (
    <div className="container-app max-w-6xl py-10">
      {/* Back link */}
      <Link
        href={vendor ? `/practice-exams/${vendor.slug}/${bundle.slug}` : '/practice-exams'}
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to exam details
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">Review your order and complete payment.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left: order summary */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
              {vendor && <span className="badge-brand">{vendor.name}</span>}
              {firstCode && <span className="badge">{firstCode}</span>}
              <span className={`badge ${hasVoucher ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'}`}>
                {hasVoucher ? 'Exam Voucher tier' : 'Practice Exam tier'}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">{bundle.title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{bundle.description}</p>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold">What you're getting</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {practiceExam && (
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{firstCode} practice exam{hasVoucher ? ' (included)' : ''}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{perAttempt} questions · {practiceExam.durationMinutes} min · Practice + Exam modes · unlimited retakes, each drawn fresh by exam domain</div>
                  </div>
                </li>
              )}
              {hasVoucher && (
                <li className="flex items-start gap-3 rounded-md bg-emerald-50 p-3 dark:bg-emerald-950/30">
                  <Ticket className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div className="flex-1">
                    <div className="font-medium text-emerald-900 dark:text-emerald-100">Real {firstCode || 'exam'} voucher</div>
                    <div className="text-xs text-emerald-800/80 dark:text-emerald-200/80">Delivered by email within 3–5 business days. Redeem with the official vendor for the real cert exam.</div>
                  </div>
                </li>
              )}
            </ul>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 text-xs dark:border-slate-700">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                {poolSize}-question pool
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Lifetime access
              </div>
            </div>
          </div>
        </div>

        {/* Right: payment + price (totals, promo code, and provider buttons
            live in the client so promo discounts update the total live) */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Suspense fallback={<div className="card p-6 text-sm text-slate-500">Loading checkout…</div>}>
            <BundleCheckoutClient bundleId={bundle.id} tier={tier} amount={amount} hasVoucher={hasVoucher} />
          </Suspense>
          <TestPaymentButton kind="bundle" bundleId={bundle.id} tier={tier} />

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            By purchasing you agree to the original practice content terms and our refund policy.
          </p>
        </aside>
      </div>
    </div>
  );
}
