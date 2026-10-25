'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useCaptcha } from '@/components/captcha';

// Verifies the signed-in customer's inbox before a full attempt: emails a
// LOGIN code and signs in with it — the otp provider marks the email
// verified — then continues to `next` (back through /complete-profile).
export function VerifyEmailForm({ email, next }: { email: string; next: string }) {
  const router = useRouter();
  const captcha = useCaptcha();
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true); setErr('');
    const r = await fetch('/api/otp/request', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, purpose: 'LOGIN', ...captcha.fields() })
    });
    setBusy(false);
    captcha.reset();
    if (!r.ok) { setErr((await r.json().catch(() => ({}))).error || 'Could not send code'); return; }
    setSent(true);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const res = await signIn('otp', { email, code, redirect: false });
    setBusy(false);
    if (res?.error) { setErr('Invalid or expired code.'); return; }
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={verify} className="mt-6 space-y-4">
      {!sent ? (
        <>
          {captcha.widget}
          <button type="button" onClick={send} className="btn-primary w-full" disabled={busy || !captcha.ready}>
            {busy ? 'Sending…' : 'Email me a 6-digit code'}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-slate-600">We sent a 6-digit code to <b>{email}</b>.</p>
          <div>
            <label htmlFor="code" className="label">Verification code</label>
            <input
              id="code" className="input text-center tracking-[0.4em]" inputMode="numeric" autoComplete="one-time-code"
              maxLength={6} required autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <button className="btn-primary w-full" disabled={busy || code.length !== 6}>{busy ? 'Verifying…' : 'Verify email'}</button>
          <button type="button" onClick={() => { setSent(false); setCode(''); }} className="w-full text-sm text-brand hover:underline">
            Send a new code
          </button>
        </>
      )}
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
    </form>
  );
}
