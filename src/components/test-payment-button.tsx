'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FlaskConical } from 'lucide-react';

type Props =
  | { kind: 'exam'; examId: string; tier: 'PRACTICE' | 'BUNDLE' | 'VOUCHER' }
  | { kind: 'bundle'; bundleId: string; tier?: 'PRACTICE' | 'VOUCHER' };

export function TestPaymentButton(props: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // Only render when the build/runtime env explicitly opts in. The flag is
  // NEXT_PUBLIC_ prefixed so it's inlined into the client bundle at build.
  if (process.env.NEXT_PUBLIC_TEST_PAYMENTS !== 'true') return null;

  async function handleClick() {
    setLoading(true);
    setErr('');
    try {
      const r = await fetch('/api/test-payment/complete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(props)
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setErr(j.error || 'Test payment failed');
        setLoading(false);
        return;
      }
      const j = await r.json().catch(() => ({}));
      router.push(j?.orderId ? `/checkout/success?orderId=${j.orderId}` : '/checkout/success');
    } catch {
      setErr('Network error');
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-md border border-dashed border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950/30">
      <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-200">
        <FlaskConical className="h-3.5 w-3.5" />
        Test mode
      </div>
      <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
        Skip PayPal — instantly mark the order paid and grant entitlements. For development only.
      </p>
      <button
        onClick={handleClick}
        disabled={loading}
        className="mt-2 w-full rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-700"
      >
        {loading ? 'Processing…' : 'Complete test payment'}
      </button>
      {err && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{err}</p>}
    </div>
  );
}
