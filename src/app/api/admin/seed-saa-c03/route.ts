import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { refoldProductPools } from '@/lib/pool-consolidation';
import { seedSaaC03 } from '@/lib/seed/saa-c03-questions';

export const runtime = 'nodejs';

/**
 * One-shot admin endpoint to refresh the SAA-C03 practice variants
 * (aws-saa-c03-p1 … -p6) with the current scenario-based question
 * sets. Idempotent — deletes the existing questions on each variant
 * and recreates 65 per variant.
 *
 * Intended for refreshing the production DB after deploy without
 * shelling into the container.
 */
export async function POST() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const result = await seedSaaC03(db);
  // Legacy seed modules write multi-variant products — fold back to one practice exam.
  await refoldProductPools(db);

  await db.adminLog.create({
    data: {
      adminId: user.id!,
      action: 'seed.saa-c03',
      targetType: 'Exam',
      targetId: 'aws-saa-c03-p1..p6',
      metadata: JSON.parse(JSON.stringify(result))
    }
  });

  return NextResponse.json({ ok: true, ...result });
}
