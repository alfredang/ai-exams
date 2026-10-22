import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { refoldProductPools } from '@/lib/pool-consolidation';
import { seedDca } from '@/lib/seed/dca-questions';

export const runtime = 'nodejs';

/**
 * One-shot admin endpoint to seed the DCA bundle (vendor + 3 practice
 * exams + 60 questions + bundle) into the current database. Idempotent —
 * safe to call repeatedly; rewrites questions tagged
 * `generatedBy: 'manual:dca-seed'`.
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

  const result = await seedDca(db);
  // Legacy seed modules write multi-variant products — fold back to one practice exam.
  await refoldProductPools(db);

  await db.adminLog.create({
    data: {
      adminId: user.id!,
      action: 'seed.dca',
      targetType: 'Bundle',
      targetId: 'docker-dca',
      metadata: JSON.parse(JSON.stringify(result))
    }
  });

  return NextResponse.json({ ok: true, ...result });
}
