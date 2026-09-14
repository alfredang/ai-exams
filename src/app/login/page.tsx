'use client';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { SocialLoginButtons } from '@/components/social-login-buttons';

export default function LoginPage() {
  return <Suspense><LoginInner /></Suspense>;
}

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') || '/post-login';
  const [tab, setTab] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function loginPassword(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const res = await signIn('password', { email, password, redirect: false });
    setBusy(false);
    if (res?.error) setErr('Invalid credentials or unverified email.');
    else router.push(`/post-login?next=${encodeURIComponent(next)}`);
  }

  async function sendOtp() {
    setBusy(true); setErr('');
    const r = await fetch('/api/otp/request', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, purpose: 'LOGIN' }) });
    setBusy(false);
    if (!r.ok) { setErr((await r.json()).error || 'Could not send code'); return; }
    setOtpSent(true);
  }

  async function loginOtp(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const res = await signIn('otp', { email, code, redirect: false });
    setBusy(false);
    if (res?.error) setErr('Invalid or expired code.');
    else router.push(`/post-login?next=${encodeURIComponent(next)}`);
  }

  return (
    <div className="container-app grid gap-6 pb-12 pt-4 md:grid-cols-2 md:pb-20 md:pt-6">
      <div className="card p-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to continue your practice.</p>

        <div className="mt-6 inline-flex rounded-lg border border-slate-200 p-1 text-sm">
          <button onClick={() => setTab('password')} className={`rounded-md px-3 py-1.5 ${tab === 'password' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>Password</button>
          <button onClick={() => setTab('otp')} className={`rounded-md px-3 py-1.5 ${tab === 'otp' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>Email code</button>
        </div>

        {tab === 'password' ? (
          <form onSubmit={loginPassword} className="mt-6 space-y-4">
            <div><label className="label">Email</label><input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input className="input pr-10" type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-2 flex items-center text-slate-500 hover:text-slate-700">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button className="btn-primary w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
            <div className="text-right text-sm"><Link href="/forgot-password" className="text-brand hover:underline">Forgot password?</Link></div>
          </form>
        ) : (
          <form onSubmit={loginOtp} className="mt-6 space-y-4">
            <div><label className="label">Email</label><input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
            {!otpSent ? (
              <button type="button" onClick={sendOtp} className="btn-outline w-full" disabled={busy || !email}>{busy ? 'Sending…' : 'Send 6-digit code'}</button>
            ) : (
              <>
                <div><label className="label">Code</label><input className="input tracking-[0.4em] text-center" maxLength={6} required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} /></div>
                <button className="btn-primary w-full" disabled={busy}>{busy ? 'Verifying…' : 'Sign in'}</button>
              </>
            )}
            {err && <p className="text-sm text-red-600">{err}</p>}
          </form>
        )}

        <SocialLoginButtons callbackUrl={next} />
      </div>

      <div className="card p-8">
        <h1 className="text-2xl font-bold tracking-tight">New to Tertiary Exams?</h1>
        <p className="mt-1 text-sm text-slate-600">Create a free account to save progress, retake teasers unlimited times, and unlock paid practice exams.</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li>✓ Free practice teaser on every exam</li>
          <li>✓ Mark for review and revisit any time</li>
          <li>✓ Per-domain breakdown of your performance</li>
        </ul>
        <Link href="/signup" className="btn-primary mt-6 inline-flex w-full">Create free account →</Link>
      </div>
    </div>
  );
}
