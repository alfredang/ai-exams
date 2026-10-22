import crypto from 'node:crypto';
import argon2 from 'argon2';
import { db } from './db';
import { sendOTPEmail } from './mail';
import { rateLimit } from './ratelimit';
import { rateLimitEmailKey } from './email-guard';

export type OtpPurpose = 'LOGIN' | 'REGISTER' | 'RESET' | 'TEASER_GATE';

// Wrong guesses allowed against one code before it is burned.
const MAX_OTP_ATTEMPTS = 5;

export async function issueOtp(
  email: string,
  purpose: OtpPurpose,
  ip: string,
  // Set when the caller has just proven it owns this inbox (a follow-up
  // LOGIN code after REGISTER/TEASER_GATE verification), so the per-email
  // bucket a fresh signup may already have used up doesn't strand them.
  opts: { inboxProven?: boolean } = {}
) {
  email = email.toLowerCase().trim();
  // 20/hour/IP (the CAPTCHA guards this path), 3/hour/mailbox
  const ipRl = rateLimit(`otp:ip:${ip}`, 20, 60 * 60_000);
  if (!ipRl.ok) return { ok: false as const, error: 'Too many requests, try later' };
  if (!opts.inboxProven) {
    const emailRl = rateLimit(`otp:email:${rateLimitEmailKey(email)}`, 3, 60 * 60_000);
    if (!emailRl.ok) return { ok: false as const, error: 'Too many codes sent to this email' };
  }

  // LOGIN and RESET codes are useless without an account, so don't mail
  // strangers' inboxes on a bot's behalf. Answer exactly as if we had sent
  // one, so the response doesn't reveal which emails are registered.
  if (purpose === 'LOGIN' || purpose === 'RESET') {
    const user = await db.user.findUnique({ where: { email }, select: { active: true } });
    if (!user?.active) return { ok: true as const };
  }

  // Invalidate any prior unconsumed codes for this email+purpose so only
  // the newest code is ever valid. Caps the brute-force surface to one
  // 6-digit code at a time, not N live codes accumulating. (Teaser-audit M2.)
  await db.otpCode.updateMany({
    where: { email, purpose, consumed: false },
    data: { consumed: true }
  });

  const code = String(crypto.randomInt(100000, 1000000));
  const otp = await db.otpCode.create({
    data: {
      email,
      codeHash: await argon2.hash(code),
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60_000)
    }
  });
  try {
    await sendOTPEmail(email, code, purpose);
  } catch {
    await db.otpCode.update({ where: { id: otp.id }, data: { consumed: true } });
    return { ok: false as const, error: 'Could not send the email code. Please try again later.', deliveryFailed: true as const };
  }
  return { ok: true as const };
}

export async function verifyOtp(email: string, code: string, purpose: OtpPurpose) {
  const otp = await db.otpCode.findFirst({
    where: {
      email: email.toLowerCase().trim(),
      purpose,
      consumed: false,
      attempts: { lt: MAX_OTP_ATTEMPTS },
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  });
  if (!otp) return false;
  const ok = /^\d{6}$/.test(code) && (await argon2.verify(otp.codeHash, code));
  if (!ok) {
    const { attempts } = await db.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
      select: { attempts: true }
    });
    // Burn it: the user has to request a fresh code.
    if (attempts >= MAX_OTP_ATTEMPTS) {
      await db.otpCode.update({ where: { id: otp.id }, data: { consumed: true } });
    }
    return false;
  }
  // Conditional consume so two concurrent correct submissions can't both win.
  const { count } = await db.otpCode.updateMany({
    where: { id: otp.id, consumed: false },
    data: { consumed: true }
  });
  return count === 1;
}

/**
 * Marks an account's email verified after the user proved they own the
 * inbox (OTP or OAuth). A password set while the account was unverified
 * (mobile pre-registration) was never tied to the inbox owner — it could be
 * an attacker's pre-hijack — so it is dropped at the same moment.
 */
export async function markInboxVerified(userId: string) {
  await db.user.updateMany({
    where: { id: userId, emailVerified: null },
    data: { emailVerified: new Date(), passwordHash: null }
  });
}
