import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { seedAz700 } from '@/lib/seed/az700-questions';

export const runtime = 'nodejs';

/**
 * One-shot admin endpoint to seed the AZ-700 bundle (vendor + 3 practice
 * exams + 195 questions + bundle) into the current database. Idempotent —
 * safe to call repeatedly; rewrites questions tagged
 * `generatedBy: 'manual:az700-seed'`.
 *
 * Intended for bootstrapping the production DB after deploy without
 * shelling into the container.
 */
export async function POST() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const result = await seedAz700(db);

  await db.adminLog.create({
    data: {
      adminId: user.id!,
      action: 'seed.az700',
      targetType: 'Bundle',
      targetId: 'microsoft-az-700',
      metadata: JSON.parse(JSON.stringify(result))
    }
  });

  return NextResponse.json({ ok: true, ...result });
}
