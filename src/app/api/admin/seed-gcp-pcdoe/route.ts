import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { refoldProductPools } from '@/lib/pool-consolidation';
import { seedGcpPcdoe } from '@/lib/seed/gcp-pcdoe-questions';

export const runtime = 'nodejs';

/**
 * One-shot admin endpoint to seed the Google Professional Cloud DevOps
 * Engineer bundle (vendor + 3 practice exams + 195 questions + bundle)
 * into the current database. Idempotent — safe to call repeatedly;
 * rewrites questions tagged `generatedBy: 'manual:gcp-pcdoe-seed'`.
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

  const result = await seedGcpPcdoe(db);
  // Legacy seed modules write multi-variant products — fold back to one practice exam.
  await refoldProductPools(db);

  await db.adminLog.create({
    data: {
      adminId: user.id!,
      action: 'seed.gcp-pcdoe',
      targetType: 'Bundle',
      targetId: 'google-professional-cloud-devops-engineer',
      metadata: JSON.parse(JSON.stringify(result))
    }
  });

  return NextResponse.json({ ok: true, ...result });
}
