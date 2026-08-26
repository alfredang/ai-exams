import { NextResponse } from 'next/server';
import argon2 from 'argon2';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Role } from '@prisma/client';

export const runtime = 'nodejs';

/**
 * One-shot admin endpoint to create/upsert Mohan (mohanpothula@gmail.com)
 * as an ADMIN user in the current database. Idempotent — safe to call
 * repeatedly. Mirrors prisma/seeds/create-mohan.ts for production, where
 * there is no shell access to run the script directly.
 *
 * Existing password credentials are preserved. MOHAN_PASSWORD is required
 * only when the account does not exist. Google sign-in links by email
 * (allowDangerousEmailAccountLinking), preserving the ADMIN role either way.
 */
export async function POST() {
  const session = await auth();
  const admin = session?.user as { id?: string; role?: string } | undefined;
  if (admin?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const email = 'mohanpothula@gmail.com';
  const name = 'Mohan';
  const existing = await db.user.findUnique({ where: { email } });
  let user;
  if (existing) {
    user = await db.user.update({
      where: { id: existing.id },
      data: { name, role: Role.ADMIN, emailVerified: new Date() }
    });
  } else {
    const password = process.env.MOHAN_PASSWORD?.trim();
    if (!password) {
      return NextResponse.json(
        { error: 'MOHAN_PASSWORD is required to create this account' },
        { status: 503 }
      );
    }
    user = await db.user.create({
      data: {
        email,
        name,
        passwordHash: await argon2.hash(password),
        role: Role.ADMIN,
        emailVerified: new Date()
      }
    });
  }

  await db.adminLog.create({
    data: {
      adminId: admin.id!,
      action: 'seed.admin-mohan',
      targetType: 'User',
      targetId: user.id,
      metadata: { email: user.email, role: user.role }
    }
  });

  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
}
