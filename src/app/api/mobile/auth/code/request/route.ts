import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { mobileError } from '@/lib/mobile-auth';
import { rateLimit } from '@/lib/ratelimit';
import { clientIp } from '@/lib/client-ip';
import { checkSignupEmail } from '@/lib/email-guard';
import { isFullName, normalizeName } from '@/lib/full-name-rules';
import { issueOtp } from '@/lib/otp';

const Body = z.object({
  email: z.string().trim().email().max(320),
  purpose: z.enum(['LOGIN', 'REGISTER']),
  name: z.string().max(120).optional()
});

/**
 * Passwordless sign-in for the native apps: emails a 6-digit code that
 * POST /api/mobile/auth/code/verify exchanges for a mobile token.
 *
 * LOGIN answers the same whether or not the account exists (issueOtp never
 * mails non-accounts). REGISTER needs a full name, screens new addresses
 * like web signup, and creates the account unverified with no password —
 * nothing can sign in to it until the code proves the inbox.
 * Native apps can't show the web CAPTCHA, so this leans on the per-IP cap
 * here plus issueOtp's 20/h/IP and 3/h/mailbox limits.
 */
export async function POST(req: Request) {
  try {
    if (!(req.headers.get('content-type') || '').includes('application/json')) {
      return NextResponse.json({ error: 'JSON body required' }, { status: 415 });
    }
    const ip = clientIp(req.headers);
    if (!rateLimit(`mobile-code:ip:${ip}`, 10, 60 * 60_000).ok) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    const email = parsed.data.email.toLowerCase();

    if (parsed.data.purpose === 'REGISTER') {
      if (!isFullName(parsed.data.name)) {
        return NextResponse.json({ error: 'Enter your first and last name (letters only).', needsFullName: true }, { status: 400 });
      }
      const name = normalizeName(parsed.data.name);
      const existing = await db.user.findUnique({ where: { email }, select: { id: true, emailVerified: true } });
      if (existing?.emailVerified) {
        return NextResponse.json({ error: 'This email already has an account. Sign in instead.', alreadyRegistered: true }, { status: 409 });
      }
      if (existing) {
        await db.user.update({ where: { id: existing.id }, data: { name } });
      } else {
        const check = await checkSignupEmail(email);
        if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
        await db.user.create({ data: { email, name, emailVerified: null } });
      }
    }

    const sent = await issueOtp(email, parsed.data.purpose, ip);
    if (!sent.ok) return NextResponse.json({ error: sent.error }, { status: 'deliveryFailed' in sent ? 503 : 429 });
    return NextResponse.json({ ok: true, message: 'If this email has an account, we sent it a 6-digit code.' });
  } catch (error) {
    return mobileError(error);
  }
}
