import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { seedCcdvFoundations } from '@/lib/seed/ccdv-foundations-questions';

export const runtime = 'nodejs';

/**
 * One-shot admin endpoint to seed the Claude Certified Developer —
 * Foundations (CCDV-F) bundle (vendor + practice exam + 53 questions +
 * bundle) into the current database. Idempotent — safe to call repeatedly;
 * rewrites questions tagged `manual:ccdv-foundations-seed`.
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

  const result = await seedCcdvFoundations(db);

  await db.adminLog.create({
    data: {
      adminId: user.id!,
      action: 'seed.ccdv-foundations',
      targetType: 'Bundle',
      targetId: 'anthropic-ccdv-foundations',
      metadata: JSON.parse(JSON.stringify(result))
    }
  });

  return NextResponse.json({ ok: true, ...result });
}
