'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCaptcha } from '@/components/captcha';
import { isFullName, normalizeName } from '@/lib/full-name-rules';

type Props = {
  count: number;
  examSlug: string;
  vendorSlug: string;
  onClose: () => void;
  // Optional overrides for the results-page reuse — when the modal opens
  // AFTER submit (on /results/<id>) the user has already seen their score,
  // so "Save your progress to see your results" is misleading copy.
  // Defaults preserve the original in-attempt phrasing used since PR #45.
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryLabel?: string;
  // Where to send the user after they verify the OTP. Defaults to the
  // exam's detail page (in-attempt flow). The results-page flow overrides
  // this to `/results/<id>` so they land back where they were.
  nextUrl?: string;
};

export function TeaserGate({
  count,
  examSlug,
  vendorSlug,
  onClose,
  eyebrow = 'Great progress!',
  title,
  description = "You've finished the free teaser. Save your progress to see your results and unlock the full practice exam — we'll send you a 6-digit code.",
  primaryLabel = 'Save my progress',
  nextUrl
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'done'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const captcha = useCaptcha();

  const resolvedTitle = title ?? `You've completed ${count} questions`;
  const resolvedNext = nextUrl ?? `/practice-exams/${vendorSlug}/${examSlug}`;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return; // guard against rapid double-submit before React re-renders the disabled button (Teaser-audit L3)
    if (!isFullName(name)) { setErr('Enter your first and last name (letters only).'); return; }
    setBusy(true); setErr('');
    const r = await fetch('/api/otp/request', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, purpose: 'TEASER_GATE', ...captcha.fields() }) });
    setBusy(false);
    captcha.reset();
    if (!r.ok) { setErr((await r.json()).error || 'Could not send code'); return; }
    setStep('otp');
  }
  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return; // guard against rapid double-submit before React re-renders the disabled button (Teaser-audit L3)
    setBusy(true); setErr('');
    // sendLoginCode: the server emails a LOGIN code on success, then we ship
    // the user to /verify-otp to complete sign-in
    const r = await fetch('/api/otp/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, code, name: normalizeName(name), purpose: 'TEASER_GATE', sendLoginCode: true }) });
    if (!r.ok) { setBusy(false); setErr((await r.json()).error || 'Verification failed'); return; }
    router.push(`/verify-otp?email=${encodeURIComponent(email)}&purpose=LOGIN&next=${encodeURIComponent(resolvedNext)}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="card w-full max-w-md p-8">
        <div className="mb-2 text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">{eyebrow}</div>
        <h2 className="text-xl font-bold">{resolvedTitle}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {description}
        </p>

        {step === 'email' && (
          <form onSubmit={send} className="mt-5 space-y-3">
            <input className="input" aria-label="Full name" required minLength={3} maxLength={120} autoComplete="name" placeholder="Full name, e.g. Tan Wei Ming" value={name} onChange={e => setName(e.target.value)} />
            <input className="input" type="email" aria-label="Email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            {captcha.widget}
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button className="btn-primary-grad w-full" disabled={busy || !captcha.ready}>{busy ? 'Sending…' : primaryLabel}</button>
            <button type="button" onClick={onClose} className="btn-ghost w-full text-sm">Continue without saving</button>
          </form>
        )}
        {step === 'otp' && (
          <form onSubmit={verify} className="mt-5 space-y-3">
            <p className="text-sm text-slate-600">We sent a 6-digit code to <b>{email}</b>.</p>
            <input className="input tracking-[0.4em] text-center" maxLength={6} required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} />
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button className="btn-primary-grad w-full" disabled={busy}>{busy ? 'Verifying…' : 'Verify and continue'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
