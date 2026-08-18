import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { seedCySA } from '@/lib/seed/cysa-questions';

export const runtime = 'nodejs';

/**
 * One-shot admin endpoint to seed the CompTIA CySA+ (CS0-004) bundle
 * (vendor + 3 practice exams + 195 questions + bundle) into the current
 * database. Idempotent — safe to call repeatedly; rewrites questions
 * tagged `generatedBy: 'manual:cysa-seed'`.
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

  const result = await seedCySA(db);

  await db.adminLog.create({
    data: {
      adminId: user.id!,
      action: 'seed.cysa',
      targetType: 'Bundle',
      targetId: 'comptia-cysa-plus',
      metadata: JSON.parse(JSON.stringify(result))
    }
  });

  return NextResponse.json({ ok: true, ...result });
}
