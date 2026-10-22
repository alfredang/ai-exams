import { NextResponse } from 'next/server';
import argon2 from 'argon2';
import { z } from 'zod';
import { db } from '@/lib/db';
import { mobileError } from '@/lib/mobile-auth';
import { rateLimit } from '@/lib/ratelimit';
import { clientIp } from '@/lib/client-ip';
import { checkSignupEmail } from '@/lib/email-guard';
import { issueOtp } from '@/lib/otp';

const Body = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email(),
  password: z.string().min(8).max(200)
});

/**
 * Creates an UNVERIFIED account and emails a REGISTER code. No token is
 * issued: the app finishes with POST /api/otp/verify
 * `{ email, code, purpose: 'REGISTER', newPassword }` and then signs in via
 * /api/mobile/auth/login. Marking the address verified here let anyone
 * pre-claim someone else's email with a password of their choosing.
 */
export async function POST(req: Request) {
  try {
    const ip = clientIp(req.headers);
    // Native apps can't show the web CAPTCHA, so this path leans on a tight
    // per-IP cap plus the disposable/undeliverable-domain screen.
    if (!rateLimit(`mobile-register:ip:${ip}`, 3, 60 * 60_000).ok) {
      return NextResponse.json({ error: 'Too many sign-ups from this network. Please try again later.' }, { status: 429 });
    }
    const body = Body.parse(await req.json());
    const email = body.email.toLowerCase();
    const existing = await db.user.findUnique({ where: { email }, select: { id: true, emailVerified: true } });
    if (existing?.emailVerified) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    if (!existing) {
      const check = await checkSignupEmail(email);
      if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
      // The pending password is never usable on its own: verification
      // replaces it with the one sent alongside the code, or drops it.
      await db.user.create({
        data: { email, name: body.name, passwordHash: await argon2.hash(body.password), emailVerified: null }
      });
    }

    const sent = await issueOtp(email, 'REGISTER', ip);
    if (!sent.ok) return NextResponse.json({ error: sent.error, needsVerification: true }, { status: 'deliveryFailed' in sent ? 503 : 429 });
    return NextResponse.json(
      { needsVerification: true, email, message: 'We emailed you a 6-digit code. Enter it to finish creating your account.' },
      { status: 202 }
    );
  } catch (error) {
    return mobileError(error);
  }
}
