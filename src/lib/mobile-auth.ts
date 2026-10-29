import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { db } from './db';

type MobileTokenPayload = {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

const TOKEN_TTL_SEC = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value) throw new Error('AUTH_SECRET or NEXTAUTH_SECRET is required for mobile auth');
  return value;
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64url');
}

function signPart(data: string) {
  return createHmac('sha256', secret()).update(data).digest('base64url');
}

export function issueMobileToken(user: { id: string; email: string; role: string }) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + TOKEN_TTL_SEC
  } satisfies MobileTokenPayload));
  const data = `${header}.${payload}`;
  return `${data}.${signPart(data)}`;
}

export function readBearerToken(req: Request) {
  const header = req.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1];
}

export function verifyMobileToken(token: string): MobileTokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expected = signPart(`${header}.${payload}`);
  const got = Buffer.from(signature);
  const want = Buffer.from(expected);
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as MobileTokenPayload;
    if (!decoded.sub || decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function requireMobileUser(req: Request) {
  const token = readBearerToken(req);
  const payload = token ? verifyMobileToken(token) : null;
  if (!payload) return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  const user = await db.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true, active: true }
  });
  if (!user?.active) return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  return { user };
}

export function mobileError(error: unknown, status = 400) {
  if (error instanceof Error) return NextResponse.json({ error: error.message }, { status });
  return NextResponse.json({ error: 'Request failed' }, { status });
}

/**
 * One-time handoff for browser-based sign-in on the native apps (Google via
 * ASWebAuthenticationSession / Custom Tabs). The app opens
 * /api/mobile/auth/google/start with a PKCE `code_challenge`; after the web
 * sign-in, /complete redirects to the app scheme with this short-lived code,
 * and the app redeems it with the matching verifier at /exchange. The token
 * itself never travels in a URL, and an intercepted code is useless without
 * the verifier that only the app holds.
 */
const HANDOFF_TTL_SEC = 120;

type HandoffPayload = { sub: string; cc: string; exp: number };

function signHandoff(data: string) {
  return createHmac('sha256', secret()).update(`mobile-handoff:${data}`).digest('base64url');
}

export function isCodeChallenge(value: string | null | undefined): value is string {
  return !!value && /^[A-Za-z0-9_-]{43}$/.test(value);
}

export function issueHandoffCode(userId: string, codeChallenge: string) {
  const payload = base64url(JSON.stringify({
    sub: userId,
    cc: codeChallenge,
    exp: Math.floor(Date.now() / 1000) + HANDOFF_TTL_SEC
  } satisfies HandoffPayload));
  return `${payload}.${signHandoff(payload)}`;
}

/** Returns the user id when the code is genuine, unexpired and matches the verifier. */
export function redeemHandoffCode(code: string, verifier: string): string | null {
  const [payload, signature] = code.split('.');
  if (!payload || !signature) return null;
  const got = Buffer.from(signature);
  const want = Buffer.from(signHandoff(payload));
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as HandoffPayload;
    if (!decoded.sub || decoded.exp < Math.floor(Date.now() / 1000)) return null;
    const challenge = createHash('sha256').update(verifier).digest('base64url');
    const a = Buffer.from(challenge);
    const b = Buffer.from(decoded.cc);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return decoded.sub;
  } catch {
    return null;
  }
}

/** Custom URL scheme the iOS app listens on via ASWebAuthenticationSession. */
const APP_CALLBACK = 'aiexams://auth/callback';

/** Redirects the auth browser back to the app with `code` or `error` (+ the app's `state`). */
export function appCallback(params: Record<string, string>) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== ''));
  return new Response(null, { status: 302, headers: { Location: `${APP_CALLBACK}?${qs}`, 'Cache-Control': 'no-store' } });
}
