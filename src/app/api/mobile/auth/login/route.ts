import { NextResponse } from 'next/server';
import argon2 from 'argon2';
import { z } from 'zod';
import { db } from '@/lib/db';
import { issueMobileToken, mobileError } from '@/lib/mobile-auth';

const Body = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200)
});

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    const user = await db.user.findUnique({
      where: { email: body.email.toLowerCase() },
      select: { id: true, email: true, name: true, role: true, active: true, emailVerified: true, passwordHash: true }
    });
    if (!user?.active || !user.passwordHash || !user.emailVerified) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const ok = await argon2.verify(user.passwordHash, body.password);
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const { passwordHash: _, active: __, emailVerified: ___, ...safeUser } = user;
    return NextResponse.json({ token: issueMobileToken(safeUser), user: safeUser });
  } catch (error) {
    return mobileError(error);
  }
}
