import argon2 from 'argon2';
import { db } from './db';
import { sendOTPEmail } from './mail';
import { rateLimit } from './ratelimit';

export type OtpPurpose = 'LOGIN' | 'REGISTER' | 'RESET' | 'TEASER_GATE';

export async function issueOtp(email: string, purpose: OtpPurpose, ip: string) {
  // 5/hour/IP, 3/hour/email
  const ipRl = rateLimit(`otp:ip:${ip}`, 5, 60 * 60_000);
  if (!ipRl.ok) return { ok: false as const, error: 'Too many requests, try later' };
  const emailRl = rateLimit(`otp:email:${email}`, 3, 60 * 60_000);
  if (!emailRl.ok) return { ok: false as const, error: 'Too many codes sent to this email' };

  // Invalidate any prior unconsumed codes for this email+purpose so only
  // the newest code is ever valid. Caps the brute-force surface to one
  // 6-digit code at a time, not N live codes accumulating. (Teaser-audit M2.)
  await db.otpCode.updateMany({
    where: { email: email.toLowerCase().trim(), purpose, consumed: false },
    data: { consumed: true }
  });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const otp = await db.otpCode.create({
    data: {
      email: email.toLowerCase().trim(),
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
    where: { email: email.toLowerCase().trim(), purpose, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' }
  });
  if (!otp) return false;
  const ok = await argon2.verify(otp.codeHash, code);
  if (!ok) return false;
  await db.otpCode.update({ where: { id: otp.id }, data: { consumed: true } });
  return true;
}
