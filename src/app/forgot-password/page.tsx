'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCaptcha } from '@/components/captcha';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const captcha = useCaptcha();

  async function send(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await fetch('/api/otp/request', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, purpose: 'RESET', ...captcha.fields() }) });
    setBusy(false);
    captcha.reset();
    // Rate-limit and CAPTCHA failures are shown; everything else moves on so
    // the page never reveals whether the email has an account.
    if (!r.ok && r.status !== 503) { setErr((await r.json()).error || 'Could not send code'); return; }
    setStep('reset');
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await fetch('/api/otp/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, code, purpose: 'RESET', newPassword }) });
    setBusy(false);
    if (!r.ok) { setErr((await r.json()).error || 'Reset failed'); return; }
    router.push('/login');
  }

  return (
    <div className="container-app max-w-md py-16">
      <h1 className="text-2xl font-bold">Reset password</h1>
      {step === 'email' ? (
        <form onSubmit={send} className="mt-6 space-y-4">
          <div><label className="label">Email</label><input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
          {captcha.widget}
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button className="btn-primary w-full" disabled={busy || !captcha.ready}>{busy ? 'Sending…' : 'Send code'}</button>
        </form>
      ) : (
        <form onSubmit={reset} className="mt-6 space-y-4">
          <p className="text-sm text-slate-600">If <b>{email}</b> exists, a code was sent.</p>
          <div><label className="label">Code</label><input className="input tracking-[0.4em] text-center" maxLength={6} required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} /></div>
          <div><label className="label">New password</label><input className="input" type="password" minLength={8} required value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Resetting…' : 'Reset password'}</button>
        </form>
      )}
    </div>
  );
}
