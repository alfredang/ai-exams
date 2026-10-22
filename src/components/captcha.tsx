'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let scriptPromise: Promise<void> | null = null;
function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error('turnstile load failed'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

function TurnstileWidget({ siteKey, resetNonce, onToken }: { siteKey: string; resetNonce: number; onToken: (t: string | null) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const cb = useRef(onToken);
  cb.current = onToken;
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return;
        // The exam runner and hero pin a light screen via .light-scope, so
        // follow that before the site-wide dark class.
        const theme = box.current.closest('.light-scope')
          ? 'light'
          : document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        widgetId.current = window.turnstile.render(box.current, {
          sitekey: siteKey,
          theme,
          size: 'flexible',
          callback: (t: string) => cb.current(t),
          'expired-callback': () => cb.current(null),
          'error-callback': () => cb.current(null)
        });
      })
      .catch(() => {
        cb.current(null);
        setLoadFailed(true);
      });
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey]);

  useEffect(() => {
    if (resetNonce && widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
  }, [resetNonce]);

  if (loadFailed) {
    return (
      <p className="text-sm text-amber-700 dark:text-amber-300">
        The &ldquo;verify you are human&rdquo; check couldn&rsquo;t load. Allow challenges.cloudflare.com in any ad or
        content blocker, then refresh the page.
      </p>
    );
  }
  return <div ref={box} className="min-h-[65px]" />;
}

// Off-screen rather than display:none, which form-filling bots skip.
function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
      <label>
        Leave this field empty
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

/**
 * Bot checks for forms that request an email code: Cloudflare Turnstile
 * (shown only once an admin sets the keys in Settings → Security; until
 * then `ready` is true), plus a honeypot and the form's open time. Spread
 * `fields()` into the /api/otp/request body. Tokens are single-use: call
 * `reset()` after every submit that sent one.
 */
export function useCaptcha() {
  const [siteKey, setSiteKey] = useState<string | null | undefined>(undefined);
  const [token, setToken] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const [hp, setHp] = useState('');
  const openedAt = useRef(0);

  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  useEffect(() => {
    fetch('/api/captcha/config')
      .then((r) => r.json())
      .then((d: { siteKey?: string | null }) => setSiteKey(d.siteKey || null))
      .catch(() => setSiteKey(null));
  }, []);

  const reset = useCallback(() => {
    setToken(null);
    setNonce((n) => n + 1);
  }, []);

  const fields = useCallback(
    () => ({ captchaToken: token ?? undefined, hp: hp || undefined, elapsedMs: Date.now() - openedAt.current }),
    [token, hp]
  );

  return {
    token,
    ready: siteKey === null || !!token,
    reset,
    fields,
    widget: (
      <>
        <Honeypot value={hp} onChange={setHp} />
        {siteKey ? <TurnstileWidget siteKey={siteKey} resetNonce={nonce} onToken={setToken} /> : null}
      </>
    )
  };
}
