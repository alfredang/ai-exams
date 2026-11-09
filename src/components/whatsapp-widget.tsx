'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { whatsappLink } from '@/lib/enquiry-topics';

/**
 * The widget belongs on pages where people are deciding: the homepage, the
 * catalogs, product pages and the information pages. It never sits on checkout,
 * sign-in, a dashboard or a running exam.
 */
function showsWidget(pathname: string) {
  return pathname === '/' || /^\/(practice-exams|exam-vouchers|vendors|p)(\/|$)/.test(pathname);
}

/** Product pages have a sticky Buy bar on phones; the mascot must not cover it. */
function hasMobileBuyBar(pathname: string) {
  return /^\/(practice-exams|exam-vouchers)\/[^/]+\/[^/]+$/.test(pathname);
}

/** Pre-canned questions shown when the user opens the widget. */
const SUGGESTIONS = [
  'Hi! I’d like to know more about your practice exams.',
  'Should I buy the practice exam or the exam voucher?',
  'Do you offer real-exam vouchers?',
  'I need help with a purchase or my account.'
];

// Recurring pop-ups, each a real offer that opens WhatsApp already filled in.
const OFFERS = [
  { title: 'Try 10 questions free', body: 'Tell us your certification and we’ll point you to the right practice exam.', text: 'Hi! Which practice exam should I try for my certification?' },
  { title: 'Free study plan', body: 'Not sure where to start? Ask us for a free plan for your certification.', text: 'Hi! Could I get a free study plan for my certification?' },
  { title: 'Practice exam included free', body: 'Every exam voucher comes with the practice exam. Ask us for a quote.', text: 'Hi! Could I get a quote for an exam voucher?' },
  { title: 'Training a team?', body: 'Practice exams or vouchers for several staff, on one invoice.', text: 'Hi! I’d like practice exams or vouchers for my team.' }
];
const OFFER_FIRST_MS = 5000;
const OFFER_EVERY_MS = 20000;
const OFFER_SHOW_MS = 9000;
const OFFER_MAX_PER_VISIT = 6;

/** Our own smiling chat bubble, worn by the mascot. Green says WhatsApp; the words in the panel confirm it. */
function ChatBubbleBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 3c-5 0-9 3.5-9 7.9 0 2.4 1.2 4.5 3.1 5.9L5.2 21l4.3-2.3c.8.2 1.6.3 2.5.3 5 0 9-3.5 9-8S17 3 12 3Z" fill="currentColor" />
      <circle cx="8.8" cy="10" r="1.25" fill="#128C4A" />
      <circle cx="15.2" cy="10" r="1.25" fill="#128C4A" />
      <path d="M8.6 13.1q3.4 3 6.8 0" fill="none" stroke="#128C4A" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Friendly support avatar for the chat launcher: a smiling agent with a
 * headset, rosy cheeks and blinking eyes. Decorative (aria-hidden) — the
 * button around it carries the label.
 */
function SupportAvatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="wa-avatar-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0ecff" />
          <stop offset="100%" stopColor="#9cc0ff" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill="url(#wa-avatar-bg)" />
      {/* shirt + neck */}
      <path d="M11 64c2-11 10-17 21-17s19 6 21 17z" fill="#1d5bf0" />
      <path d="M26 47.5c2 2.2 4 3.2 6 3.2s4-1 6-3.2" fill="none" stroke="#bcd3ff" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="28" y="40" width="8" height="8" rx="3.5" fill="#f3c3a0" />
      {/* face */}
      <circle cx="32" cy="30" r="15" fill="#ffdcc2" />
      {/* hair */}
      <path d="M17 30.5C16.4 19.6 23.4 13 32 13s15.6 6.6 15 17.5c-1.6-4.6-4.8-7.6-9-8.6-2.4 3.2-7.6 5.2-13.6 5.2-3.2 0-5.6 1.2-7.4 3.4z" fill="#3a2a22" />
      {/* eyes (blink) */}
      <g className="motion-safe:animate-blink [transform-box:fill-box] [transform-origin:center]">
        <ellipse cx="26" cy="31.5" rx="2.3" ry="2.8" fill="#1b2433" />
        <ellipse cx="38" cy="31.5" rx="2.3" ry="2.8" fill="#1b2433" />
        <circle cx="26.9" cy="30.4" r="0.85" fill="#fff" />
        <circle cx="38.9" cy="30.4" r="0.85" fill="#fff" />
      </g>
      {/* cheeks + smile */}
      <ellipse cx="22.2" cy="36.4" rx="2.6" ry="1.6" fill="#ff9fb3" opacity="0.75" />
      <ellipse cx="41.8" cy="36.4" rx="2.6" ry="1.6" fill="#ff9fb3" opacity="0.75" />
      <path d="M27.6 37.2q4.4 4.6 8.8 0" fill="none" stroke="#8a3b1e" strokeWidth="1.7" strokeLinecap="round" />
      {/* headset */}
      <path d="M15.6 31a16.4 16.4 0 0 1 32.8 0" fill="none" stroke="#15306a" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="12.6" y="27" width="5.6" height="10" rx="2.8" fill="#15306a" />
      <rect x="45.8" y="27" width="5.6" height="10" rx="2.8" fill="#15306a" />
      <path d="M16 36.5c1 5.6 5 8.4 10.4 8.4" fill="none" stroke="#15306a" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="27" cy="44.9" r="2" fill="#25D366" />
    </svg>
  );
}

const OFFERS_MUTED_KEY = 'wa-offers-muted';

export function WhatsAppWidget() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const [offer, setOffer] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  openRef.current = open;
  const visible = showsWidget(pathname);

  // First offer after 5s, then one every 20s, capped per visit. Paused while
  // the panel is open; dismissing one mutes them for the session.
  useEffect(() => {
    if (!visible) return;
    try { if (sessionStorage.getItem(OFFERS_MUTED_KEY) === '1') return; } catch {}
    let shown = 0;
    let hide: ReturnType<typeof setTimeout> | undefined;
    let every: ReturnType<typeof setInterval> | undefined;
    const tick = () => {
      if (openRef.current) return;
      if (shown >= OFFER_MAX_PER_VISIT) { if (every) clearInterval(every); return; }
      setOffer(shown % OFFERS.length);
      shown += 1;
      if (hide) clearTimeout(hide);
      hide = setTimeout(() => setOffer(null), OFFER_SHOW_MS);
    };
    const first = setTimeout(() => { tick(); every = setInterval(tick, OFFER_EVERY_MS); }, OFFER_FIRST_MS);
    return () => {
      clearTimeout(first);
      if (hide) clearTimeout(hide);
      if (every) clearInterval(every);
    };
  }, [visible]);

  function muteOffers() {
    setOffer(null);
    try { sessionStorage.setItem(OFFERS_MUTED_KEY, '1'); } catch {}
  }

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!visible) return null;

  return (
    <div ref={rootRef} className={`pointer-events-none fixed right-4 z-50 flex flex-col items-end gap-3 print:hidden sm:right-5 ${hasMobileBuyBar(pathname) ? 'bottom-24 lg:bottom-5' : 'bottom-5'}`}>
      {open && (
        <div
          role="dialog"
          aria-label="Chat with us on WhatsApp"
          className="pointer-events-auto w-[min(20rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
            <span className="relative shrink-0">
              <SupportAvatar className="h-10 w-10 rounded-full ring-2 ring-white/40" />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#25D366] ring-2 ring-[#075E54]" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">Tertiary Exams Support</p>
              <p className="text-xs text-white/80">Typically replies within minutes</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1 text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Hi there 👋 How can we help? Pick a question to start:</p>
            {SUGGESTIONS.map((q) => (
              <a
                key={q}
                href={whatsappLink(q)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-[#25D366] hover:bg-[#25D366]/10 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-white"
              >
                {q}
              </a>
            ))}
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1ebe5a]"
            >
              <ChatBubbleBadge className="h-5 w-5" />
              Start a chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      <div className="flex items-end gap-3">
        {offer !== null && !open && (
          <div key={offer} className="pointer-events-auto relative mb-2 flex max-w-[16rem] items-start gap-2 rounded-2xl rounded-br-sm border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-lift motion-safe:animate-pop-in dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <a href={whatsappLink(OFFERS[offer].text)} target="_blank" rel="noopener noreferrer" className="leading-snug">
              <span className="block font-semibold text-slate-900 dark:text-white">{OFFERS[offer].title}</span>
              {OFFERS[offer].body}
            </a>
            <button
              type="button"
              onClick={muteOffers}
              aria-label="Dismiss these messages"
              className="-mr-1 -mt-0.5 shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => { setOffer(null); setOpen((v) => !v); }}
          aria-label={open ? 'Close WhatsApp chat' : 'Chat with us on WhatsApp'}
          aria-expanded={open}
          className="group pointer-events-auto relative h-[76px] w-[76px] shrink-0 rounded-full bg-white p-0.5 shadow-[0_0_0_6px_rgba(37,211,102,0.2),0_10px_28px_rgba(15,23,42,0.28)] ring-1 ring-slate-200 transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 motion-safe:animate-bob dark:bg-slate-900 dark:ring-slate-700"
        >
          <SupportAvatar className="h-full w-full rounded-full" />
          <span
            className={`absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full text-white shadow ring-2 ring-white dark:ring-slate-900 ${open ? 'bg-slate-500' : 'bg-[#25D366]'}`}
            aria-hidden="true"
          >
            {open ? <X className="h-3.5 w-3.5" /> : <ChatBubbleBadge className="h-5 w-5" />}
          </span>
        </button>
      </div>
    </div>
  );
}
