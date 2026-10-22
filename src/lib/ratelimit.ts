type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  b.count += 1;
  if (b.count > limit) return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  return { ok: true, retryAfter: 0 };
}

/**
 * Checks a bucket without counting this call. Pair with `rateLimit()` on
 * failure only, so a limit caps wrong guesses rather than every attempt.
 */
export function isRateLimited(key: string, limit: number): boolean {
  const b = buckets.get(key);
  return !!b && b.resetAt >= Date.now() && b.count >= limit;
}
