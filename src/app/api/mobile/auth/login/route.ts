import { NextResponse } from 'next/server';
import argon2 from 'argon2';
import { z } from 'zod';
import { db } from '@/lib/db';
import { issueMobileToken, mobileError } from '@/lib/mobile-auth';
import { isRateLimited, rateLimit } from '@/lib/ratelimit';
import { clientIp } from '@/lib/client-ip';
import { rateLimitEmailKey } from '@/lib/email-guard';
import { issueOtp } from '@/lib/otp';

const Body = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200)
});

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    const ip = clientIp(req.headers);
    const email = body.email.toLowerCase();
    // Password-guessing cap, per network and per mailbox. Only failures
    // count; the burst cap bounds parallel guesses.
    const ipKey = `mobile-login:ip:${ip}`;
    const emailKey = `mobile-login:email:${rateLimitEmailKey(email)}`;
    if (isRateLimited(ipKey, 20) || isRateLimited(emailKey, 10) || !rateLimit(`mobile-login:burst:${ip}`, 60, 15 * 60_000).ok) {
      return NextResponse.json({ error: 'Too many sign-in attempts. Please try again later.' }, { status: 429 });
    }
    const fail = () => {
      rateLimit(ipKey, 20, 15 * 60_000);
      rateLimit(emailKey, 10, 15 * 60_000);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    };

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, active: true, emailVerified: true, passwordHash: true }
    });
    if (!user?.active || !user.passwordHash) return fail();
    const ok = await argon2.verify(user.passwordHash, body.password);
    if (!ok) return fail();

    // Right password, inbox not yet proven (fresh mobile register). Resend
    // the REGISTER code — still subject to the per-mailbox OTP cap.
    if (!user.emailVerified) {
      const sent = await issueOtp(email, 'REGISTER', ip);
      return NextResponse.json(
        {
          error: sent.ok
            ? 'Please verify your email first. We sent you a new 6-digit code.'
            : `Please verify your email first. ${sent.error}`,
          needsVerification: true,
          email: user.email
        },
        { status: 403 }
      );
    }

    const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    return NextResponse.json({ token: issueMobileToken(safeUser), user: safeUser });
  } catch (error) {
    return mobileError(error);
  }
}
