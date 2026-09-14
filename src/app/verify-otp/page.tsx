'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

function VerifyOtpInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const email = sp.get('email') || '';
  const purpose = (sp.get('purpose') as 'LOGIN' | 'REGISTER' | 'TEASER_GATE') || 'LOGIN';
  // Same-origin relative paths only. `next` is attacker-controllable in a
  // crafted link; without this, values like `//evil.com` or `https://evil.com`
  // would navigate the user off-site after sign-in. (Teaser-audit L2.)
  const rawNext = sp.get('next') || '/post-login';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/post-login';
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    if (purpose === 'LOGIN') {
      const res = await signIn('otp', { email, code, redirect: false });
      setBusy(false);
      if (res?.error) setErr('Invalid or expired code.');
      else router.push(`/post-login?next=${encodeURIComponent(next)}`);
      return;
    }
    const r = await fetch('/api/otp/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, code, purpose }) });
    setBusy(false);
    if (!r.ok) { setErr((await r.json()).error || 'Verification failed'); return; }
    if (purpose === 'TEASER_GATE') router.push(next);
    else router.push('/login');
  }

  return (
    <div className="container-app max-w-md py-16">
      <h1 className="text-2xl font-bold">Enter the code we sent</h1>
      <p className="mt-1 text-sm text-slate-600">A 6-digit code was sent to <b>{email}</b>.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div><label className="label">Code</label><input className="input tracking-[0.4em] text-center" maxLength={6} required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} /></div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Verifying…' : 'Verify'}</button>
      </form>
    </div>
  );
}

export default function VerifyOtpPage() {
  return <Suspense><VerifyOtpInner /></Suspense>;
}
