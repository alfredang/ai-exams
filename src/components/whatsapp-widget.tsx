'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

const WA_NUMBER = '6588666375';

/**
 * Routes where the floating chat widget adds chrome but no value — the same
 * app-shell surfaces the footer hides on (see <FooterGate>).
 */
const HIDDEN_PREFIXES = [
  '/admin-dashboard',
  '/exam/',
  '/my-content',
  '/checkout'
];

/** Pre-canned questions shown when the user opens the widget. */
const SUGGESTIONS = [
  'Hi! I’d like to know more about your practice exams.',
  'Which bundle is right for my certification?',
  'Do you offer real-exam vouchers?',
  'I need help with a purchase or my account.'
];

function waLink(text?: string) {
  const base = `https://wa.me/${WA_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Official WhatsApp glyph (inline so we don't depend on a brand-icon pack). */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.01 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.46 1.73 6.4L3.2 28.8l6.56-1.72a12.74 12.74 0 0 0 6.25 1.6h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.64-3.75-9.06A12.7 12.7 0 0 0 16.01 3.2Zm0 23.04h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.02 1.05 1.07-3.92-.25-.4a10.6 10.6 0 0 1-1.63-5.66c0-5.86 4.78-10.62 10.64-10.62 2.84 0 5.5 1.11 7.51 3.12a10.55 10.55 0 0 1 3.11 7.51c0 5.86-4.77 10.63-10.63 10.63Zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.97-2.35-.26-.62-.52-.54-.71-.55l-.6-.01c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.64 0 1.56 1.13 3.06 1.29 3.27.16.21 2.23 3.41 5.4 4.78.75.32 1.34.52 1.8.66.76.24 1.44.21 1.98.13.6-.09 1.89-.77 2.16-1.52.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
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

const GREETING_KEY = 'wa-greeting-dismissed';

export function WhatsAppWidget() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const [greet, setGreet] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // A small "Hi there" bubble pops out once per browser session, then hides
  // itself; dismissing or opening the chat keeps it away for the session.
  useEffect(() => {
    let dismissed = false;
    try { dismissed = sessionStorage.getItem(GREETING_KEY) === '1'; } catch {}
    if (dismissed) return;
    const show = setTimeout(() => setGreet(true), 2500);
    const hide = setTimeout(() => setGreet(false), 12000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  function dismissGreeting() {
    setGreet(false);
    try { sessionStorage.setItem(GREETING_KEY, '1'); } catch {}
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

  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) return null;

  return (
    <div ref={rootRef} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 print:hidden">
      {open && (
        <div
          role="dialog"
          aria-label="Chat with us on WhatsApp"
          className="w-[min(20rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
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
                href={waLink(q)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-[#25D366] hover:bg-[#25D366]/10 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-white"
              >
                {q}
              </a>
            ))}
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1ebe5a]"
            >
              <WhatsAppGlyph className="h-4 w-4" />
              Start a chat
            </a>
          </div>
        </div>
      )}

      <div className="flex items-end gap-3">
        {greet && !open && (
          <div className="relative mb-2 flex max-w-[15rem] items-start gap-2 rounded-2xl rounded-br-sm border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-lift motion-safe:animate-pop-in dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <button
              type="button"
              onClick={() => { dismissGreeting(); setOpen(true); }}
              className="text-left leading-snug"
            >
              <span className="font-semibold text-slate-900 dark:text-white">Hi there! 👋</span>{' '}
              Questions about an exam? Chat with us on WhatsApp.
            </button>
            <button
              type="button"
              onClick={dismissGreeting}
              aria-label="Dismiss greeting"
              className="-mr-1 -mt-0.5 shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => { dismissGreeting(); setOpen((v) => !v); }}
          aria-label={open ? 'Close WhatsApp chat' : 'Chat with us on WhatsApp'}
          aria-expanded={open}
          className="group relative h-16 w-16 shrink-0 rounded-full bg-white p-0.5 shadow-lift ring-1 ring-slate-200 transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 motion-safe:animate-bob dark:bg-slate-900 dark:ring-slate-700"
        >
          <SupportAvatar className="h-full w-full rounded-full" />
          <span
            className={`absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full text-white shadow ring-2 ring-white dark:ring-slate-900 ${open ? 'bg-slate-500' : 'bg-[#25D366]'}`}
            aria-hidden="true"
          >
            {open ? <X className="h-3.5 w-3.5" /> : <WhatsAppGlyph className="h-3.5 w-3.5" />}
          </span>
        </button>
      </div>
    </div>
  );
}
