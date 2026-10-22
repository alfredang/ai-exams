import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { refoldProductPools } from '@/lib/pool-consolidation';
import { seedAi900 } from '@/lib/seed/ai900-questions';

export const runtime = 'nodejs';

/**
 * One-shot admin endpoint to seed the AI-900 bundle (vendor + 3 practice
 * exams + 195 questions + bundle) into the current database. Idempotent —
 * safe to call repeatedly; wipes all questions on the three exam rows
 * before inserting the curated 195 (the pre-existing pool was heavily
 * skewed toward ML — 154/360 — and needed full replacement).
 *
 * Mirror of /api/admin/seed-pl300 — Wave-3 standardized 3×65 build aligned
 * to the current Microsoft Learn AI-900 study guide (verified 2026-05-20):
 *   AI Workloads 18 / ML 18 / CV 18 / NLP 18 / GenAI 28
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

  const result = await seedAi900(db);
  // Legacy seed modules write multi-variant products — fold back to one practice exam.
  await refoldProductPools(db);

  await db.adminLog.create({
    data: {
      adminId: user.id!,
      action: 'seed.ai900',
      targetType: 'Bundle',
      targetId: 'microsoft-ai-900',
      metadata: JSON.parse(JSON.stringify(result))
    }
  });

  return NextResponse.json({ ok: true, ...result });
}
