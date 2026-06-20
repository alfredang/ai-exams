import { createHmac, timingSafeEqual } from 'crypto';
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
