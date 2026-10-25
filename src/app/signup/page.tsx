'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { SocialLoginButtons } from '@/components/social-login-buttons';
import { useCaptcha } from '@/components/captcha';
import { isFullName, normalizeName } from '@/lib/full-name-rules';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const captcha = useCaptcha();

  async function startSignup(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    if (!isFullName(name)) { setErr('Enter your first and last name (letters only, e.g. "Tan Wei Ming").'); return; }
    setBusy(true);
    const r = await fetch('/api/otp/request', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, purpose: 'REGISTER', ...captcha.fields() }) });
    setBusy(false);
    captcha.reset();
    if (!r.ok) { setErr((await r.json()).error || 'Could not send code'); return; }
    setStep('otp');
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await fetch('/api/otp/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, code, purpose: 'REGISTER', name: normalizeName(name), newPassword: password || undefined, sendLoginCode: !password })
    });
    if (!r.ok) { setBusy(false); setErr((await r.json()).error || 'Verification failed'); return; }
    if (password) {
      const res = await signIn('password', { email, password, redirect: false });
      setBusy(false);
      if (!res?.error) router.push('/post-login');
      else router.push('/login');
    } else {
      // OTP-only user — the verify call above already emailed a login code
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&purpose=LOGIN`);
      setBusy(false);
    }
  }

  return (
    <div className="container-app grid gap-6 pb-12 pt-4 md:grid-cols-2 md:pb-20 md:pt-6">
      <div className="card p-8">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-slate-600">Free to start. No credit card required.</p>

        {step === 'form' ? (
          <form onSubmit={startSignup} className="mt-6 space-y-4">
            <div><label htmlFor="name" className="label">Full name</label><input id="name" className="input" required minLength={3} maxLength={120} autoComplete="name" placeholder="e.g. Tan Wei Ming" value={name} onChange={e => setName(e.target.value)} /><p className="mt-1 text-xs text-slate-500">As on your ID — it appears on score reports and vouchers.</p></div>
            <div><label className="label">Email</label><input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><label className="label">Password <span className="text-xs text-slate-500">(optional — you can sign in with email codes)</span></label><input className="input" type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} /></div>
            {captcha.widget}
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button className="btn-primary w-full" disabled={busy || !captcha.ready}>{busy ? 'Sending code…' : 'Continue'}</button>
          </form>
        ) : (
          <form onSubmit={verify} className="mt-6 space-y-4">
            <p className="text-sm text-slate-600">We sent a 6-digit code to <b>{email}</b>.</p>
            <div><label className="label">Verification code</label><input className="input tracking-[0.4em] text-center" maxLength={6} required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} /></div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button className="btn-primary w-full" disabled={busy}>{busy ? 'Verifying…' : 'Create account'}</button>
          </form>
        )}

        <SocialLoginButtons callbackUrl="/post-login" />
      </div>

      <div className="card p-8">
        <h2 className="text-xl font-semibold">Already have an account?</h2>
        <p className="mt-1 text-sm text-slate-600">Sign in with email and password, or with a one-time email code.</p>
        <Link href="/login" className="btn-outline mt-4 inline-flex w-full">Sign in →</Link>
      </div>
    </div>
  );
}
