import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { refoldProductPools } from '@/lib/pool-consolidation';
import { seedAz104 } from '@/lib/seed/az104-questions';

export const runtime = 'nodejs';

/**
 * One-shot admin endpoint to seed the AZ-104 bundle (Microsoft vendor +
 * 3 practice exams + 195 questions + bundle) into the current database.
 * Idempotent — safe to call repeatedly; rewrites questions tagged
 * `generatedBy: 'manual:az104-seed'`.
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

  const result = await seedAz104(db);
  // Legacy seed modules write multi-variant products — fold back to one practice exam.
  await refoldProductPools(db);

  await db.adminLog.create({
    data: {
      adminId: user.id!,
      action: 'seed.az104',
      targetType: 'Bundle',
      targetId: 'microsoft-az-104',
      metadata: JSON.parse(JSON.stringify(result))
    }
  });

  return NextResponse.json({ ok: true, ...result });
}
