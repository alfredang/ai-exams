'use client';
import { useEffect, useState } from 'react';
import { CreditCard, Landmark, QrCode, Wallet } from 'lucide-react';

export type MethodId = 'PAYPAL' | 'HITPAY' | 'PAYNOW' | 'STRIPE';

export type MethodInfo = { id: MethodId; enabled: boolean; currency?: string };

export type CheckoutMethods = {
  methods: MethodInfo[];
  paypalClientId: string | null;
};

export function usePaymentMethods() {
  const [data, setData] = useState<CheckoutMethods | null>(null);
  useEffect(() => {
    fetch('/api/checkout/methods')
      .then((r) => r.json())
      .then((d) => setData({ methods: d.methods ?? [], paypalClientId: d.paypalClientId ?? null }))
      .catch(() => setData({ methods: [], paypalClientId: null }));
  }, []);
  return data;
}

const META: Record<MethodId, { label: string; detail: string; icon: typeof CreditCard }> = {
  PAYPAL: { label: 'PayPal', detail: 'PayPal balance or credit / debit card', icon: Wallet },
  STRIPE: { label: 'Card via Stripe', detail: 'Card, Apple Pay, Google Pay', icon: CreditCard },
  HITPAY: { label: 'HitPay', detail: 'Card, PayNow, GrabPay, Apple Pay', icon: Landmark },
  PAYNOW: { label: 'PayNow QR', detail: 'Scan with any Singapore banking app', icon: QrCode }
};

type Props = {
  methods: MethodInfo[];
  selected: MethodId;
  onSelect: (m: MethodId) => void;
};

export function PaymentMethodsPicker({ methods, selected, onSelect }: Props) {
  const enabled = methods.filter((m) => m.enabled);
  if (enabled.length <= 1) return null; // no choice to make
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">Payment method</h3>
      <div className="grid gap-2" role="radiogroup" aria-label="Payment method">
        {enabled.map((m) => {
          const isSel = selected === m.id;
          const meta = META[m.id];
          const Icon = meta.icon;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={isSel}
              onClick={() => onSelect(m.id)}
              className={`flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition ${
                isSel
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:bg-blue-950/30'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
              }`}
            >
              <span
                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                  isSel ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
                  {meta.label}
                  {m.currency && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {m.currency}
                    </span>
                  )}
                </span>
                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{meta.detail}</span>
              </span>
              <span
                aria-hidden
                className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                  isSel ? 'border-blue-600 bg-blue-600 shadow-[inset_0_0_0_2.5px_white]' : 'border-slate-300 dark:border-slate-600'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
