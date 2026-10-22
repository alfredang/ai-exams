import { getSetting } from './settings';

/**
 * Cloudflare Turnstile — bot check on every endpoint that sends an email
 * code (signup, login, password reset, teaser gate).
 *
 * Keys are runtime settings (admin → Settings → Security). Until BOTH keys
 * are set the check is skipped, so the site keeps working before an admin
 * has created a Turnstile widget.
 */
export async function getCaptchaSiteKey(): Promise<string | null> {
  const [site, secret] = await Promise.all([getSetting('TURNSTILE_SITE_KEY'), getSetting('TURNSTILE_SECRET_KEY')]);
  return site && secret ? site : null;
}

let warnedUnconfigured = false;

// Cloudflare's published test secrets answer with hostname "example.com".
const TEST_SECRET = /^[123]x0{20,}A{2}$/;

// Hostnames this site is served on. A token solved on any other hostname
// came from a widget page we don't control.
function siteHosts(headers?: Headers): Set<string> {
  const hosts = new Set<string>();
  for (const url of [process.env.NEXTAUTH_URL, process.env.APP_URL]) {
    try {
      if (url) hosts.add(new URL(url).hostname.toLowerCase());
    } catch {
      /* ignore malformed env */
    }
  }
  for (const h of [headers?.get('x-forwarded-host'), headers?.get('host')]) {
    const host = h?.split(',')[0].trim().replace(/:\d+$/, '').toLowerCase();
    if (host) hosts.add(host);
  }
  return hosts;
}

export async function verifyCaptcha(token: string | undefined | null, ip: string, headers?: Headers): Promise<boolean> {
  const [site, secret] = await Promise.all([getSetting('TURNSTILE_SITE_KEY'), getSetting('TURNSTILE_SECRET_KEY')]);
  if (!site || !secret) {
    if (!warnedUnconfigured) {
      warnedUnconfigured = true;
      console.warn('turnstile: keys not set (admin → Settings → Security) — email-code endpoints run WITHOUT a CAPTCHA');
    }
    return true;
  }
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== 'unknown') body.set('remoteip', ip);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(8000)
    });
    const data = (await r.json()) as { success?: boolean; hostname?: string };
    if (data.success !== true) return false;
    if (data.hostname && !TEST_SECRET.test(secret)) {
      const hosts = siteHosts(headers);
      if (hosts.size && !hosts.has(data.hostname.toLowerCase())) {
        console.warn('turnstile: token solved on unexpected hostname', data.hostname);
        return false;
      }
    }
    return true;
  } catch (err) {
    // Fail closed: if Cloudflare is unreachable we refuse rather than let
    // unchecked traffic through. Rate limits still apply either way.
    console.error('turnstile siteverify failed', err);
    return false;
  }
}
