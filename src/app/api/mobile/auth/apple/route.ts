import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';
import { db } from '@/lib/db';
import { issueMobileToken, mobileError } from '@/lib/mobile-auth';
import { markInboxVerified } from '@/lib/otp';
import { isFullName, normalizeName } from '@/lib/full-name-rules';
import { rateLimit } from '@/lib/ratelimit';
import { clientIp } from '@/lib/client-ip';

const APPLE_ISSUER = 'https://appleid.apple.com';
/** Native Sign in with Apple tokens carry the app's bundle id as `aud`. */
const APPLE_AUDIENCES = ['com.tertiaryinfotech.aiexams'];
const appleKeys = createRemoteJWKSet(new URL(`${APPLE_ISSUER}/auth/keys`));

const Body = z.object({
  identityToken: z.string().min(20).max(5000),
  // Raw nonce; the app put its SHA-256 (hex) on the Apple request.
  nonce: z.string().min(16).max(128),
  // Apple only shares the name on the first authorization, from the device.
  fullName: z.string().max(120).nullish()
});

type AppleClaims = { sub?: string; email?: string; email_verified?: boolean | string; nonce?: string };

/**
 * Sign in with Apple for the iOS app (App Store guideline 4.8 — offered
 * alongside Google). Verifies Apple's identity token and its nonce, then finds the user by
 * the linked Apple account, else by Apple's verified email (linking it, as the
 * web OAuth providers do), else creates the account. Returns `{ token, user }`.
 */
export async function POST(req: Request) {
  try {
    if (!(req.headers.get('content-type') || '').includes('application/json')) {
      return NextResponse.json({ error: 'JSON body required' }, { status: 415 });
    }
    if (!rateLimit(`mobile-apple:ip:${clientIp(req.headers)}`, 30, 60 * 60_000).ok) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: 'Invalid sign-in request.' }, { status: 400 });

    let claims: AppleClaims;
    try {
      ({ payload: claims } = await jwtVerify<AppleClaims>(parsed.data.identityToken, appleKeys, {
        issuer: APPLE_ISSUER,
        audience: APPLE_AUDIENCES
      }));
    } catch {
      return NextResponse.json({ error: 'Apple sign-in could not be verified. Please try again.' }, { status: 401 });
    }
    const sub = claims.sub;
    const nonceHash = createHash('sha256').update(parsed.data.nonce).digest('hex');
    if (!sub || claims.nonce !== nonceHash) return NextResponse.json({ error: 'Apple sign-in could not be verified. Please try again.' }, { status: 401 });
    const verified = claims.email_verified === true || claims.email_verified === 'true';
    const email = verified && claims.email ? claims.email.toLowerCase().trim() : null;
    const name = isFullName(parsed.data.fullName) ? normalizeName(parsed.data.fullName) : null;

    const select = { id: true, email: true, name: true, role: true, active: true } as const;
    const linked = await db.account.findUnique({
      where: { provider_providerAccountId: { provider: 'apple', providerAccountId: sub } },
      select: { user: { select } }
    });
    let user = linked?.user ?? null;

    if (!user) {
      if (!email) {
        return NextResponse.json({ error: 'Apple did not share an email address. Sign in with your email instead.' }, { status: 400 });
      }
      user = await db.user.findUnique({ where: { email }, select })
        ?? await db.user.create({ data: { email, name, emailVerified: new Date() }, select });
      await db.account.create({ data: { userId: user.id, type: 'oidc', provider: 'apple', providerAccountId: sub } });
    }
    if (!user.active) return NextResponse.json({ error: 'This account is not available.' }, { status: 403 });

    // Apple verified the inbox (same as the web OAuth sign-in event).
    await markInboxVerified(user.id);
    if (name && !isFullName(user.name)) {
      user = await db.user.update({ where: { id: user.id }, data: { name }, select });
    }

    const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    return NextResponse.json({ token: issueMobileToken(safeUser), user: safeUser });
  } catch (error) {
    return mobileError(error);
  }
}
