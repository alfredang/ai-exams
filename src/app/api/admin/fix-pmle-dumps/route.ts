import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { removePmleDumps } from '@/lib/seed/pmle-dump-removal';

export const runtime = 'nodejs';

/**
 * One-shot admin endpoint to remove the dump-sourced questions from the Google
 * Professional ML Engineer bank and retire the variants that removal leaves
 * unusable.
 *
 * Idempotent — safe to call repeatedly; the signature-matched rows are gone
 * after the first run.
 *
 * See src/lib/seed/pmle-dump-removal.ts for the signature and the reasoning
 * (notably: why removal and not re-grounding — Google moved this exam from
 * Vertex AI to Gemini Enterprise Agent Platform effective 2026-06-01, so the
 * whole bank needs re-authoring against the new guide, which is a separate job).
 *
 * Intended for fixing production after deploy without shelling into the box.
 */
export async function POST() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const result = await removePmleDumps(db);

  await db.adminLog.create({
    data: {
      adminId: user.id!,
      action: 'fix.pmle_dumps',
      targetType: 'Bundle',
      targetId: 'google-professional-ml-engineer',
      metadata: JSON.parse(JSON.stringify(result))
    }
  });

  return NextResponse.json({ ok: true, ...result });
}
