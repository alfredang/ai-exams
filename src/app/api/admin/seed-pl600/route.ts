import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { refoldProductPools } from '@/lib/pool-consolidation';
import { seedPl600 } from '@/lib/seed/pl600-questions';

export const runtime = 'nodejs';

/**
 * One-shot admin endpoint to seed the PL-600 bundle (vendor + 3 practice
 * exams + 195 questions + bundle) into the current database. Idempotent —
 * safe to call repeatedly; rewrites questions tagged
 * `generatedBy: 'manual:pl600-seed'`.
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

  const result = await seedPl600(db);
  // Legacy seed modules write multi-variant products — fold back to one practice exam.
  await refoldProductPools(db);

  await db.adminLog.create({
    data: {
      adminId: user.id!,
      action: 'seed.pl600',
      targetType: 'Bundle',
      targetId: 'microsoft-pl-600',
      metadata: JSON.parse(JSON.stringify(result))
    }
  });

  return NextResponse.json({ ok: true, ...result });
}
