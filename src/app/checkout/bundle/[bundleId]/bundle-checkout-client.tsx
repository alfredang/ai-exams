'use client';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { BillingAddressCard } from '@/components/checkout/billing-address-card';
import { PaymentMethodsPicker, usePaymentMethods, type MethodId } from '@/components/checkout/payment-methods';
import { PayNowModal } from '@/components/checkout/paynow-modal';
import { PromoCodeInput, type PromoApplied } from '@/components/checkout/promo-code';
import { formatPrice } from '@/lib/utils';

const TRUST_COPY: Record<MethodId, string> = {
  PAYPAL: 'Encrypted payment via PayPal. We never see your card details.',
  STRIPE: 'Encrypted payment via Stripe Checkout. We never see your card details.',
  HITPAY: 'Encrypted payment via HitPay. We never see your card details.',
  PAYNOW: 'Direct bank transfer via PayNow QR — scan with your banking app.'
};

export function BundleCheckoutClient({
  bundleId,
  tier,
  amount,
  hasVoucher
}: {
  bundleId: string;
  tier?: 'PRACTICE' | 'VOUCHER';
  amount: number; // cents, pre-discount
  hasVoucher: boolean;
}) {
  const router = useRouter();
  const [err, setErr] = useState('');
  const [addressId, setAddressId] = useState<string | null>(null);
  const [method, setMethod] = useState<MethodId>('PAYPAL');
  const [busy, setBusy] = useState<MethodId | null>(null);
  const [promo, setPromo] = useState<PromoApplied | null>(null);
  const [paynowSession, setPaynowSession] = useState<{ orderId: string; qrDataUrl: string; reference: string; amount: number; currency: string } | null>(null);
  const data = usePaymentMethods();
  const methods = data?.methods ?? null;

  useEffect(() => {
    if (!methods) return;
    const enabled = methods.filter((m) => m.enabled);
    if (enabled.length && !enabled.find((m) => m.id === method)) setMethod(enabled[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods]);

  const total = promo ? promo.totalCents : amount;
  const couponCode = promo?.code ?? null;

  async function createRedirectOrder(kind: 'HITPAY' | 'STRIPE' | 'PAYNOW') {
    setErr('');
    setBusy(kind);
    const url = kind === 'HITPAY' ? '/api/hitpay/create-order' : kind === 'STRIPE' ? '/api/stripe/create-order' : '/api/paynow/create-order';
    let d: any = null;
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bundleId, tier, billingAddressId: addressId, couponCode })
      });
      d = await r.json().catch(() => null);
      if (!r.ok) {
        setErr(d?.message || `Could not start ${kind === 'PAYNOW' ? 'PayNow' : kind === 'HITPAY' ? 'HitPay' : 'Stripe'} checkout. Please try again.`);
        return;
      }
    } catch {
      setErr('Network error — please check your connection and try again.');
      return;
    } finally {
      setBusy(null);
    }
    if (kind === 'PAYNOW') {
      setPaynowSession({ orderId: d.orderId, qrDataUrl: d.qrDataUrl, reference: d.reference, amount: d.amount, currency: d.currency });
    } else {
      window.location.href = d.url;
    }
  }

  const paypalReady = !!data?.paypalClientId;

  return (
    <div className="space-y-4">
      {/* Order total — updates live when a promo code is applied */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-300">Order total</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Subtotal</dt>
            <dd className="font-medium">{formatPrice(amount)}</dd>
          </div>
          {promo && (
            <div className="flex justify-between text-emerald-700 dark:text-emerald-300">
              <dt>Promo «{promo.code}»</dt>
              <dd className="font-medium">−{formatPrice(promo.discountCents)}</dd>
            </div>
          )}
        </dl>
        <div className="mt-3">
          <PromoCodeInput bundleId={bundleId} tier={tier} onApply={setPromo} onClear={() => setPromo(null)} />
        </div>
        <div className="mt-4 flex items-baseline justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
          <span className="text-sm font-semibold">Total (SGD)</span>
          <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">{formatPrice(total)}</span>
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Pay securely
        </div>

        <BillingAddressCard selectedId={addressId} onSelect={setAddressId} />

        {!methods && (
          <div className="flex items-center gap-2 rounded-md border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading payment options…
          </div>
        )}
        {methods && <PaymentMethodsPicker methods={methods} selected={method} onSelect={setMethod} />}

        {!addressId && (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            Select or add a billing address to continue.
          </p>
        )}

        <div className={addressId ? '' : 'pointer-events-none opacity-50'}>
          {method === 'PAYPAL' && data && (
            paypalReady ? (
              <PayPalScriptProvider options={{ clientId: data.paypalClientId!, currency: 'SGD', intent: 'capture' }}>
                <PayPalButtons
                  style={{ layout: 'vertical', shape: 'rect' }}
                  disabled={!addressId}
                  // Re-mount the buttons when the coupon changes so createOrder
                  // always posts the current couponCode.
                  forceReRender={[couponCode, addressId]}
                  createOrder={async () => {
                    setErr('');
                    const r = await fetch('/api/paypal/create-bundle-order', {
                      method: 'POST',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ bundleId, tier, billingAddressId: addressId, couponCode })
                    });
                    if (!r.ok) { setErr('Could not create order.'); throw new Error('create-bundle-order failed'); }
                    return (await r.json()).paypalOrderId;
                  }}
                  onApprove={async (data) => {
                    const r = await fetch('/api/paypal/capture', {
                      method: 'POST',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ paypalOrderId: data.orderID })
                    });
                    if (!r.ok) { setErr('Capture failed.'); router.push('/checkout/failed'); return; }
                    const d = await r.json().catch(() => ({}));
                    router.push(d?.orderId ? `/checkout/success?orderId=${d.orderId}` : '/checkout/success');
                  }}
                  onError={() => { setErr('Payment error. Please try again.'); router.push('/checkout/failed'); }}
                />
              </PayPalScriptProvider>
            ) : (
              <p className="rounded-md border border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-700">
                PayPal isn&apos;t configured yet. Please choose another payment method.
              </p>
            )
          )}
          {method === 'HITPAY' && (
            <button type="button" disabled={!addressId || busy === 'HITPAY'} onClick={() => createRedirectOrder('HITPAY')} className="btn-primary-grad w-full">
              {busy === 'HITPAY' ? 'Redirecting to HitPay…' : `Pay ${formatPrice(total)} with HitPay`}
            </button>
          )}
          {method === 'PAYNOW' && (
            <button type="button" disabled={!addressId || busy === 'PAYNOW'} onClick={() => createRedirectOrder('PAYNOW')} className="btn-primary-grad w-full">
              {busy === 'PAYNOW' ? 'Generating QR…' : 'Pay with PayNow'}
            </button>
          )}
          {method === 'STRIPE' && (
            <button type="button" disabled={!addressId || busy === 'STRIPE'} onClick={() => createRedirectOrder('STRIPE')} className="btn-primary-grad w-full">
              {busy === 'STRIPE' ? 'Redirecting to Stripe…' : `Pay ${formatPrice(total)} with card`}
            </button>
          )}
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
      </div>

      <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
        <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p>
            {TRUST_COPY[method]}{' '}
            {hasVoucher
              ? <>Voucher codes are emailed within <b>3–5 business days</b>; practice access unlocks immediately.</>
              : <>Practice access unlocks immediately after payment.</>}
          </p>
        </div>
      </div>

      {paynowSession && (
        <PayNowModal
          orderId={paynowSession.orderId}
          qrDataUrl={paynowSession.qrDataUrl}
          reference={paynowSession.reference}
          amount={paynowSession.amount}
          currency={paynowSession.currency}
          onClose={() => setPaynowSession(null)}
        />
      )}
    </div>
  );
}
