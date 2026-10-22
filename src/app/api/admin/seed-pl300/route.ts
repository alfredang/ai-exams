import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { refoldProductPools } from '@/lib/pool-consolidation';
import { seedPl300 } from '@/lib/seed/pl300-questions';

export const runtime = 'nodejs';

/**
 * One-shot admin endpoint to seed the PL-300 bundle (vendor + 3 practice
 * exams + 195 questions + bundle) into the current database. Idempotent —
 * safe to call repeatedly; rewrites questions tagged
 * `generatedBy: 'manual:pl300-seed'`.
 *
 * Mirror of /api/admin/seed-ms102 — Wave-3 standardized 3×65 build aligned
 * to the current Microsoft Learn PL-300 study guide (verified 2026-05-20):
 *   Prepare 28 / Model 28 / Visualize 28 / Manage & Secure 16
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

  const result = await seedPl300(db);
  // Legacy seed modules write multi-variant products — fold back to one practice exam.
  await refoldProductPools(db);

  await db.adminLog.create({
    data: {
      adminId: user.id!,
      action: 'seed.pl300',
      targetType: 'Bundle',
      targetId: 'microsoft-pl-300',
      metadata: JSON.parse(JSON.stringify(result))
    }
  });

  return NextResponse.json({ ok: true, ...result });
}
