import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { refoldProductPools } from '@/lib/pool-consolidation';
import { seedJava17 } from '@/lib/seed/java17-questions';

export const runtime = 'nodejs';

/**
 * One-shot admin endpoint to seed the Oracle Java SE 17 Developer
 * (1Z0-829) bundle (vendor + 3 practice exams + 195 questions +
 * bundle) into the current database. Idempotent — safe to call
 * repeatedly; rewrites questions tagged
 * `generatedBy: 'manual:java17-seed'`.
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

  const result = await seedJava17(db);
  // Legacy seed modules write multi-variant products — fold back to one practice exam.
  await refoldProductPools(db);

  await db.adminLog.create({
    data: {
      adminId: user.id!,
      action: 'seed.java17',
      targetType: 'Bundle',
      targetId: 'oracle-java-se-17-1z0-829',
      metadata: JSON.parse(JSON.stringify(result))
    }
  });

  return NextResponse.json({ ok: true, ...result });
}
