import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { seedCcarProfessional } from '@/lib/seed/ccar-professional-questions';

export const runtime = 'nodejs';

/**
 * One-shot admin endpoint to seed the Claude Certified Architect —
 * Professional (CCAR-P) bundle (vendor + practice exam + 63 questions +
 * bundle) into the current database. Idempotent — safe to call repeatedly;
 * rewrites questions tagged `manual:ccar-professional-seed`.
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

  const result = await seedCcarProfessional(db);

  await db.adminLog.create({
    data: {
      adminId: user.id!,
      action: 'seed.ccar-professional',
      targetType: 'Bundle',
      targetId: 'anthropic-ccar-professional',
      metadata: JSON.parse(JSON.stringify(result))
    }
  });

  return NextResponse.json({ ok: true, ...result });
}
