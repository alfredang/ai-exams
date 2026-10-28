'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  orderId: string;
  qrDataUrl: string;
  reference: string;
  amount: number;
  currency: string;
  /** The USD list price this SGD amount was converted from. */
  storeAmount?: number;
  storeCurrency?: string;
  /** USD→SGD rate in basis points (12806 = 1.2806). */
  fxRateBps?: number;
  onClose: () => void;
};

export function PayNowModal({ orderId, qrDataUrl, reference, amount, currency, storeAmount, storeCurrency, fxRateBps, onClose }: Props) {
  const router = useRouter();
  const [polled, setPolled] = useState(0);

  useEffect(() => {
    let active = true;
    const tick = async () => {
      try {
        const r = await fetch(`/api/orders/${orderId}/status`, { cache: 'no-store' });
        if (!r.ok) return;
        const d = await r.json();
        if (!active) return;
        if (d.status === 'PAID') router.replace(`/checkout/success?orderId=${orderId}`);
        else if (d.status === 'FAILED') router.replace('/checkout/failed');
      } catch { /* ignore */ }
    };
    const t = setInterval(() => { setPolled((n) => n + 1); void tick(); }, 4000);
    void tick();
    return () => { active = false; clearInterval(t); };
  }, [orderId, router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Pay with PayNow</h2>
        <p className="mt-1 text-sm text-slate-500">
          Scan this QR with any Singapore bank app. Your order activates after we confirm receipt (usually within a few minutes).
        </p>
        <div className="mt-4 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="PayNow QR" className="h-64 w-64 rounded border border-slate-200 dark:border-slate-700" />
          <div className="mt-3 text-center">
            <div className="text-xs text-slate-500">Reference</div>
            <code className="text-sm">{reference}</code>
          </div>
          <div className="mt-2 text-center">
            <div className="text-xs text-slate-500">Amount</div>
            <div className="text-lg font-semibold">{currency} {(amount / 100).toFixed(2)}</div>
            {storeAmount != null && fxRateBps ? (
              <div className="mt-1 text-xs text-slate-500">
                {storeCurrency ?? 'USD'} {(storeAmount / 100).toFixed(2)} converted at 1 USD = {(fxRateBps / 10000).toFixed(4)} SGD (today&apos;s rate)
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-5 flex justify-between text-xs text-slate-500">
          <span>Waiting for confirmation… ({polled})</span>
          <button type="button" onClick={onClose} className="text-slate-600 hover:underline dark:text-slate-300">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
