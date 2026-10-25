'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Loader2, Lock, Send } from 'lucide-react';
import { useCaptcha } from '@/components/captcha';
import { WhatsAppGlyph } from '@/components/support/whatsapp-glyph';
import { TOPIC_EVENT } from '@/components/support/topic-link';
import { ENQUIRY_TOPICS, whatsappLink, type EnquiryTopicId } from '@/lib/enquiry-topics';

const PLACEHOLDERS: Record<EnquiryTopicId, string> = {
  STUDY_PLAN: 'e.g. I work in IT support and want to move into cloud. I have about 6 weeks — which exam should I start with?',
  VOUCHER_QUOTE: 'e.g. I need a voucher for the AWS Solutions Architect Associate exam and plan to sit it next month.',
  TEAM: 'e.g. We have 12 engineers preparing for AZ-900 and would like one invoice for the company.',
  ORDER_HELP: 'e.g. My order number is TE-…, I paid but cannot see the Practice Exam in My Exams.',
  CONTENT: 'e.g. Question 14 of the CKA exam explains option B but marks option C as correct.',
  OTHER: 'How can we help?'
};

type Status = 'idle' | 'sending' | 'sent';

export function EnquiryForm({ certifications, teaserN }: { certifications: string[]; teaserN: number }) {
  const captcha = useCaptcha();
  const [topic, setTopic] = useState<EnquiryTopicId>('STUDY_PLAN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferWhatsApp, setPreferWhatsApp] = useState(true);
  const [certification, setCertification] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  // Deep links such as /p/support?topic=TEAM#enquiry preselect a topic;
  // <TopicLink> does the same on this page without a reload.
  useEffect(() => {
    const pick = (t: unknown) => {
      if (typeof t === 'string' && ENQUIRY_TOPICS.some((x) => x.id === t)) setTopic(t as EnquiryTopicId);
    };
    pick(new URLSearchParams(window.location.search).get('topic'));
    const onTopic = (e: Event) => pick((e as CustomEvent).detail);
    window.addEventListener(TOPIC_EVENT, onTopic);
    return () => window.removeEventListener(TOPIC_EVENT, onTopic);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus('sending');
    try {
      const r = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ topic, name, email, phone, preferWhatsApp, certification, message, ...captcha.fields() })
      });
      const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!r.ok || !d.ok) {
        setError(d.error || 'Something went wrong. Please try again, or message us on WhatsApp.');
        setStatus('idle');
        captcha.reset();
        return;
      }
      setStatus('sent');
    } catch {
      setError('Network error. Please try again, or message us on WhatsApp.');
      setStatus('idle');
      captcha.reset();
    }
  }

  if (status === 'sent') {
    const topicLabel = ENQUIRY_TOPICS.find((t) => t.id === topic)?.label ?? '';
    const waText = `Hi, I'm ${name}. I just sent an enquiry on Tertiary Exams (${topicLabel}${certification ? ` — ${certification}` : ''}).`;
    return (
      <div className="flex flex-col items-center px-6 py-10 text-center sm:px-10" role="status">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-xl font-bold">Thanks, {name.split(' ')[0]} — we&rsquo;ve got it.</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-300">
          A certification advisor will reply to <b className="text-ink dark:text-white">{email}</b>
          {preferWhatsApp && phone ? ' or on WhatsApp' : ''} within one business day.
        </p>
        <div className="mt-6 flex w-full max-w-sm flex-col gap-2.5">
          <a
            href={whatsappLink(waText)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn min-h-[46px] bg-[#25D366] text-white hover:bg-[#1ebe5a]"
          >
            <WhatsAppGlyph className="h-5 w-5" /> Need it sooner? Chat on WhatsApp
          </a>
          <Link href="/practice-exams" className="btn-outline min-h-[46px]">
            Meanwhile, try {teaserN} free questions <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  const selected = ENQUIRY_TOPICS.find((t) => t.id === topic)!;

  return (
    <form onSubmit={submit} className="space-y-4 p-5 sm:p-7" noValidate={false}>
      <fieldset>
        <legend className="label">What can we help with?</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {ENQUIRY_TOPICS.map((t) => {
            const on = t.id === topic;
            return (
              <label
                key={t.id}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-[13px] font-medium transition focus-within:ring-2 focus-within:ring-brand/40 ${
                  on
                    ? 'border-brand bg-brand text-white shadow-sm dark:border-brand-400 dark:bg-brand-500'
                    : 'border-line bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="topic"
                  value={t.id}
                  checked={on}
                  onChange={() => setTopic(t.id)}
                  className="sr-only"
                />
                {t.label}
              </label>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted dark:text-slate-400">{selected.hint}</p>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="enq-name" className="label">Full name</label>
          <input id="enq-name" className="input min-h-[42px]" required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="enq-email" className="label">Email</label>
          <input id="enq-email" type="email" className="input min-h-[42px]" required maxLength={200} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="enq-phone" className="label">
            Mobile / WhatsApp <span className="font-normal text-muted dark:text-slate-400">(optional)</span>
          </label>
          <input
            id="enq-phone"
            type="tel"
            inputMode="tel"
            className="input min-h-[42px]"
            placeholder="+65 9123 4567"
            maxLength={40}
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {phone.trim() && (
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-[13px] text-slate-700 dark:text-slate-300">
              <input type="checkbox" className="h-4 w-4 rounded accent-[#25D366]" checked={preferWhatsApp} onChange={(e) => setPreferWhatsApp(e.target.checked)} />
              Reply to me on WhatsApp
            </label>
          )}
        </div>
        <div>
          <label htmlFor="enq-cert" className="label">
            Certification <span className="font-normal text-muted dark:text-slate-400">(if known)</span>
          </label>
          <input
            id="enq-cert"
            list="enq-cert-list"
            className="input min-h-[42px]"
            placeholder="e.g. AWS SAA-C03, AZ-900"
            maxLength={200}
            value={certification}
            onChange={(e) => setCertification(e.target.value)}
          />
          <datalist id="enq-cert-list">
            {certifications.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <label htmlFor="enq-msg" className="label">Message</label>
        <textarea
          id="enq-msg"
          className="input min-h-[120px] resize-y leading-relaxed"
          required
          minLength={10}
          maxLength={4000}
          placeholder={PLACEHOLDERS[topic]}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {captcha.widget}

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={status === 'sending' || !captcha.ready} className="btn-primary-grad min-h-[50px] w-full text-base disabled:opacity-60">
        {status === 'sending' ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
        {topic === 'STUDY_PLAN' ? 'Get my free study plan' : topic === 'VOUCHER_QUOTE' || topic === 'TEAM' ? 'Get my quote' : 'Send enquiry'}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted dark:text-slate-400">
        <Lock className="h-3.5 w-3.5" aria-hidden="true" /> No spam. We only use your details to reply to this enquiry. Never send passwords or card details.
      </p>
    </form>
  );
}
