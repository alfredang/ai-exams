import { resolveMx } from 'node:dns/promises';

/**
 * Screens addresses before we create an account for them: rejects common
 * throwaway/disposable providers and domains that cannot receive mail.
 * Only used on paths that can create a user (signup, teaser gate, mobile
 * register) — existing users are never blocked from signing in.
 */

// The high-volume disposable providers seen in signup abuse. Not exhaustive
// on purpose — the MX check and the CAPTCHA catch the long tail.
const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com', '10minutemail.net', '20minutemail.com', '33mail.com', 'anonaddy.me',
  'burnermail.io', 'byom.de', 'dispostable.com', 'dropmail.me', 'emailondeck.com',
  'fakeinbox.com', 'getairmail.com', 'getnada.com', 'guerrillamail.biz', 'guerrillamail.com',
  'guerrillamail.de', 'guerrillamail.info', 'guerrillamail.net', 'guerrillamail.org',
  'guerrillamailblock.com', 'harakirimail.com', 'inboxbear.com', 'inboxkitten.com',
  'maildrop.cc', 'mailcatch.com', 'mailinator.com', 'mailinator.net', 'mailnesia.com',
  'mailpoof.com', 'mailsac.com', 'mintemail.com', 'mohmal.com', 'moakt.com', 'mytemp.email',
  'nada.email', 'sharklasers.com', 'spam4.me', 'spamgourmet.com', 'temp-mail.io',
  'temp-mail.org', 'tempail.com', 'tempmail.com', 'tempmail.dev', 'tempmail.net',
  'tempmailo.com', 'tempr.email', 'throwawaymail.com', 'tmail.ws', 'tmpmail.net',
  'tmpmail.org', 'trashmail.com', 'trashmail.de', 'trashmail.net', 'yopmail.com',
  'yopmail.fr', 'yopmail.net', 'emailfake.com', 'fakemail.net', 'mailtemp.net',
  'linshiyouxiang.net', 'grr.la', 'pokemail.net', 'spambox.us', 'discard.email',
  'mail.tm', 'mailto.plus', 'fexpost.com', 'fexbox.org', 'rover.info', 'chitthi.in',
  'cyclelove.cc', 'example.com', 'example.org', 'example.net', 'test.com'
]);

const mxCache = new Map<string, { ok: boolean; at: number }>();
const MX_TTL_MS = 6 * 60 * 60_000;

async function domainAcceptsMail(domain: string): Promise<boolean> {
  const hit = mxCache.get(domain);
  if (hit && Date.now() - hit.at < MX_TTL_MS) return hit.ok;
  let ok: boolean;
  try {
    const mx = await Promise.race([
      resolveMx(domain),
      new Promise<never>((_, rej) => setTimeout(() => rej(Object.assign(new Error('timeout'), { code: 'ETIMEOUT' })), 4000))
    ]);
    // RFC 7505 "null MX" (a single record with exchange ".") means the
    // domain explicitly accepts no mail.
    ok = mx.some((r) => r.exchange && r.exchange !== '.');
  } catch (err) {
    const code = (err as { code?: string }).code;
    // Only a definitive "no such domain / no MX" is a rejection. A DNS
    // outage or timeout must not lock real people out of signing up.
    if (code === 'ENOTFOUND' || code === 'ENODATA') ok = false;
    else return true;
  }
  mxCache.set(domain, { ok, at: Date.now() });
  return ok;
}

export async function checkSignupEmail(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const domain = email.toLowerCase().trim().split('@')[1] || '';
  if (!domain) return { ok: false, error: 'Please enter a valid email address.' };
  const parts = domain.split('.');
  for (let i = 0; i < parts.length - 1; i++) {
    if (DISPOSABLE_DOMAINS.has(parts.slice(i).join('.'))) {
      return { ok: false, error: 'Disposable email addresses are not accepted. Please use your personal or work email.' };
    }
  }
  if (!(await domainAcceptsMail(domain))) {
    return { ok: false, error: `The domain "${domain}" cannot receive email. Please check the address.` };
  }
  return { ok: true };
}

const DOTLESS_DOMAINS = new Set(['gmail.com', 'googlemail.com']);

/**
 * Canonical mailbox for rate-limit buckets only — never store it. Folds
 * the aliases one inbox answers to (`a.b+x@gmail.com` → `ab@gmail.com`) so
 * a bot can't get a fresh per-email bucket by varying the tag or dots.
 */
export function rateLimitEmailKey(email: string): string {
  const [rawLocal, rawDomain = ''] = email.toLowerCase().trim().split('@');
  let local = rawLocal.split('+')[0];
  let domain = rawDomain;
  if (DOTLESS_DOMAINS.has(domain)) {
    local = local.replace(/\./g, '');
    domain = 'gmail.com';
  }
  return `${local}@${domain}`;
}
