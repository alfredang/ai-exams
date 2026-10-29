import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { issueMobileToken, mobileError, redeemHandoffCode } from '@/lib/mobile-auth';
import { rateLimit } from '@/lib/ratelimit';
import { clientIp } from '@/lib/client-ip';

const Body = z.object({
  code: z.string().min(10).max(1000),
  verifier: z.string().regex(/^[A-Za-z0-9._~-]{43,128}$/)
});

/** Google sign-in for the native apps, step 3: handoff code + PKCE verifier → `{ token, user }`. */
export async function POST(req: Request) {
  try {
    if (!(req.headers.get('content-type') || '').includes('application/json')) {
      return NextResponse.json({ error: 'JSON body required' }, { status: 415 });
    }
    if (!rateLimit(`mobile-google-exchange:ip:${clientIp(req.headers)}`, 30, 60 * 60_000).ok) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: 'Invalid sign-in request.' }, { status: 400 });

    const userId = redeemHandoffCode(parsed.data.code, parsed.data.verifier);
    if (!userId) return NextResponse.json({ error: 'Sign-in expired. Please try again.' }, { status: 400 });

    const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, role: true, active: true } });
    if (!user?.active) return NextResponse.json({ error: 'This account is not available.' }, { status: 403 });

    const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    return NextResponse.json({ token: issueMobileToken(safeUser), user: safeUser });
  } catch (error) {
    return mobileError(error);
  }
}
