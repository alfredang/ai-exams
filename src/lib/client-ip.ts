/**
 * Best-effort client IP for rate-limit keys.
 *
 * Production sits behind exactly one proxy (Coolify's), which APPENDS the
 * connecting address to X-Forwarded-For. Anything to the left of that entry
 * was supplied by the client and is spoofable, so we take the right-most
 * entry. Keying on the whole header let an attacker send a fresh fake
 * prefix per request and get a brand-new rate-limit bucket every time.
 */
export function clientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const last = xff.split(',').map((s) => s.trim()).filter(Boolean).pop();
    if (last) return last;
  }
  return headers.get('x-real-ip')?.trim() || 'unknown';
}
