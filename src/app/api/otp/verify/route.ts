import { NextResponse } from 'next/server';
import { z } from 'zod';
import argon2 from 'argon2';
import { db } from '@/lib/db';
import { issueOtp, markInboxVerified, verifyOtp } from '@/lib/otp';
import { rateLimit } from '@/lib/ratelimit';
import { clientIp } from '@/lib/client-ip';
import { rateLimitEmailKey } from '@/lib/email-guard';
import { isFullName, normalizeName } from '@/lib/full-name-rules';

const Body = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  purpose: z.enum(['REGISTER', 'RESET', 'TEASER_GATE']),
  newPassword: z.string().min(8).optional(),
  name: z.string().max(120).optional(),
  // Signup-without-password and the teaser gate finish with an email-code
  // sign-in. The follow-up LOGIN code is issued here rather than by a second
  // /api/otp/request call: that endpoint needs a fresh CAPTCHA, and this
  // caller has just proven they own the inbox.
  sendLoginCode: z.boolean().optional()
});

export async function POST(req: Request) {
  // Defensive parsing — invalid JSON or schema-mismatched payload returns
  // 400, not a 500 from an unhandled throw. The UI always sends a valid
  // body; this is for direct API callers + curl probes.
  const raw = await req.json().catch(() => null);
  if (!raw) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  const result = Body.safeParse(raw);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: result.error.flatten() },
      { status: 400 }
    );
  }
  const data = result.data;

  // Rate-limit verification — caps 6-digit OTP brute-force and argon2 CPU abuse
  // on this unauthenticated endpoint, and bounds unsolicited user-row creation
  // via the TEASER_GATE / REGISTER upserts. Keyed on IP and on the target email.
  const ip = clientIp(req.headers);
  const rlEmail = rateLimitEmailKey(data.email);
  if (!rateLimit(`otp-verify:ip:${ip}`, 20, 3_600_000).ok ||
      !rateLimit(`otp-verify:email:${rlEmail}`, 10, 3_600_000).ok) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  const email = data.email.toLowerCase().trim();

  // Every account that registration creates or finishes must end up with a
  // full name. Checked before the code is consumed so a bad name doesn't
  // burn it. An existing account that already has one keeps it.
  const givenName = isFullName(data.name) ? normalizeName(data.name) : undefined;
  if (data.purpose === 'REGISTER' || data.purpose === 'TEASER_GATE') {
    const named = await db.user.findUnique({ where: { email }, select: { name: true } });
    if (!givenName && !isFullName(named?.name)) {
      return NextResponse.json({ error: 'Enter your first and last name (letters only).', needsFullName: true }, { status: 400 });
    }
  }

  const ok = await verifyOtp(data.email, data.code, data.purpose);
  if (!ok) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });

  if (data.purpose === 'REGISTER') {
    const passwordHash = data.newPassword ? await argon2.hash(data.newPassword) : null;
    // A password stored on a still-unverified account (mobile register) was
    // never proven to belong to this inbox's owner: replace it or drop it.
    const prior = await db.user.findUnique({ where: { email }, select: { emailVerified: true } });
    const dropPassword = !!prior && !prior.emailVerified && !passwordHash;
    const user = await db.user.upsert({
      where: { email },
      update: {
        emailVerified: new Date(),
        name: givenName,
        ...(passwordHash ? { passwordHash, passwordSetupRequired: false } : dropPassword ? { passwordHash: null } : {})
      },
      create: { email, emailVerified: new Date(), name: givenName, passwordHash }
    });

    // Migrate any guest attempts associated with the gt cookie to this user
    const cookieHeader = req.headers.get('cookie') || '';
    const gt = /(?:^|; )gt=([^;]+)/.exec(cookieHeader)?.[1];
    if (gt) {
      await db.attempt.updateMany({ where: { guestToken: gt, userId: null }, data: { userId: user.id, guestToken: null } });
    }
    if (data.sendLoginCode) {
      const sent = await sendFollowUpLoginCode(email, ip);
      if (sent) return sent;
    }
    return NextResponse.json({ ok: true });
  }

  if (data.purpose === 'RESET') {
    if (!data.newPassword) return NextResponse.json({ error: 'newPassword required' }, { status: 400 });
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'No such user' }, { status: 400 });
    // The reset code proves the inbox, so an unverified account is verified too.
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: await argon2.hash(data.newPassword), passwordSetupRequired: false, emailVerified: user.emailVerified ?? new Date() }
    });
    return NextResponse.json({ ok: true });
  }

  if (data.purpose === 'TEASER_GATE') {
    // Just create or attach the user; teaser gate flow follows up with sign-in via OTP separately
    const existing = await db.user.findUnique({ where: { email }, select: { id: true, name: true } });
    const user = existing ?? (await db.user.create({ data: { email, name: givenName, emailVerified: new Date() }, select: { id: true } }));
    if (existing) {
      await markInboxVerified(existing.id);
      if (givenName && !isFullName(existing.name)) await db.user.update({ where: { id: existing.id }, data: { name: givenName } });
    }
    const cookieHeader = req.headers.get('cookie') || '';
    const gt = /(?:^|; )gt=([^;]+)/.exec(cookieHeader)?.[1];
    if (gt) {
      await db.attempt.updateMany({ where: { guestToken: gt, userId: null }, data: { userId: user.id, guestToken: null } });
    }
    if (data.sendLoginCode) {
      const sent = await sendFollowUpLoginCode(email, ip);
      if (sent) return sent;
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unsupported purpose' }, { status: 400 });
}

// The account is verified by now, so a failure here must not read as a
// plain error — the code just used is consumed and retrying it can't work.
async function sendFollowUpLoginCode(email: string, ip: string) {
  const r = await issueOtp(email, 'LOGIN', ip, { inboxProven: true });
  if (r.ok) return null;
  return NextResponse.json(
    {
      error: `Your email is verified, but we couldn't send your sign-in code (${r.error}). Please sign in from the login page.`,
      verified: true
    },
    { status: 'deliveryFailed' in r ? 503 : 429 }
  );
}
