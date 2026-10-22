'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ClaimFreeBundleButton({ bundleId }: { bundleId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function claim() {
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/bundles/claim', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bundleId })
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setErr(j.error || `Claim failed (${r.status}).`);
        setBusy(false);
        return;
      }
      router.push('/checkout/success');
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={claim}
        disabled={busy}
        className="btn-primary-grad mt-4 block w-full text-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Claiming…' : 'Claim free practice exam'}
      </button>
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
    </>
  );
}
