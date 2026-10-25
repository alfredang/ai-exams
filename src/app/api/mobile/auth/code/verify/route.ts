import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { issueMobileToken, mobileError } from '@/lib/mobile-auth';
import { rateLimit } from '@/lib/ratelimit';
import { clientIp } from '@/lib/client-ip';
import { rateLimitEmailKey } from '@/lib/email-guard';
import { markInboxVerified, verifyOtp } from '@/lib/otp';

const Body = z.object({
  email: z.string().trim().email().max(320),
  code: z.string().regex(/^\d{6}$/),
  purpose: z.enum(['LOGIN', 'REGISTER'])
});

/**
 * Exchanges a code from /api/mobile/auth/code/request for a mobile token.
 * The code proves the inbox, so the account is marked verified here
 * (markInboxVerified also drops any password set before verification).
 */
export async function POST(req: Request) {
  try {
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: 'Enter the 6-digit code from the email.' }, { status: 400 });
    const email = parsed.data.email.toLowerCase();
    const ip = clientIp(req.headers);
    if (!rateLimit(`otp-verify:ip:${ip}`, 20, 3_600_000).ok ||
        !rateLimit(`otp-verify:email:${rateLimitEmailKey(email)}`, 10, 3_600_000).ok) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }

    const ok = await verifyOtp(email, parsed.data.code, parsed.data.purpose);
    if (!ok) return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 400 });

    const user = await db.user.findUnique({ where: { email }, select: { id: true, email: true, name: true, role: true, active: true } });
    if (!user?.active) return NextResponse.json({ error: 'This account is not available.' }, { status: 403 });
    await markInboxVerified(user.id);

    const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    return NextResponse.json({ token: issueMobileToken(safeUser), user: safeUser });
  } catch (error) {
    return mobileError(error);
  }
}
