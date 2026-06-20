import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireMobileUser } from '@/lib/mobile-auth';

export async function DELETE(req: Request) {
  const auth = await requireMobileUser(req);
  if ('response' in auth) return auth.response;

  const user = await db.user.findUnique({
    where: { id: auth.user.id },
    select: { id: true, email: true, anonymizedAt: true }
  });
  if (!user || user.anonymizedAt) return NextResponse.json({ ok: true });

  const tag = `deleted-${user.id.slice(0, 8)}@example.invalid`;
  await db.user.update({
    where: { id: user.id },
    data: {
      email: tag,
      name: null,
      passwordHash: null,
      nationality: null,
      active: false,
      anonymizedAt: new Date(),
      sessionVersion: { increment: 1 }
    }
  });

  return NextResponse.json({ ok: true });
}
