import { NextResponse } from 'next/server';
import argon2 from 'argon2';
import { z } from 'zod';
import { db } from '@/lib/db';
import { issueMobileToken, mobileError } from '@/lib/mobile-auth';

const Body = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email(),
  password: z.string().min(8).max(200)
});

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    const email = body.email.toLowerCase();
    const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const user = await db.user.create({
      data: {
        email,
        name: body.name,
        passwordHash: await argon2.hash(body.password),
        emailVerified: new Date()
      },
      select: { id: true, email: true, name: true, role: true }
    });
    return NextResponse.json({ token: issueMobileToken(user), user });
  } catch (error) {
    return mobileError(error);
  }
}
