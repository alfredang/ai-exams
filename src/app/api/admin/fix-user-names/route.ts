import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * One-shot admin endpoint to correct two users' display names to their full
 * legal names (requested 2026-07-27). The admin dashboard is read-only for the
 * `name` field, so there is no UI path for this — hence a guarded one-shot.
 *
 * Keyed by email (User.email is unique), so no id lookup is needed.
 *
 * Defensive and idempotent:
 *   - if the account already has the target name  → reported 'already-renamed', skipped
 *   - if the account is missing                    → reported 'not-found', skipped
 *   - if the current name is NEITHER the expected old name NOR the new name
 *                                                  → reported 'skipped-mismatch', NOT written
 * The mismatch guard means this can never clobber a name that someone/something
 * else has since changed — it only advances the exact expected old value.
 *
 * Writes one AdminLog row per rename (`action: 'user.rename'`, before/after).
 */

const RENAMES: { email: string; expectedOldName: string; newName: string }[] = [
  { email: 'lwj5@hotmail.com', expectedOldName: 'LWJ', newName: 'LEE WEEN JIANN' },
  { email: 'jorgelee@me.com', expectedOldName: 'Jorge Lee', newName: 'LEE JIA YANG, JORGE' }
];

export async function POST() {
  const session = await auth();
  const admin = session?.user as { id?: string; role?: string } | undefined;
  if (admin?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const results: {
    email: string;
    action: 'renamed' | 'already-renamed' | 'not-found' | 'skipped-mismatch';
    from?: string | null;
    to?: string;
  }[] = [];

  for (const r of RENAMES) {
    const user = await db.user.findUnique({ where: { email: r.email }, select: { id: true, name: true } });

    if (!user) {
      results.push({ email: r.email, action: 'not-found' });
      continue;
    }
    if (user.name === r.newName) {
      results.push({ email: r.email, action: 'already-renamed', from: user.name, to: r.newName });
      continue;
    }
    if (user.name !== r.expectedOldName) {
      // Current name is something other than what we expected to replace —
      // refuse rather than overwrite an unexpected value.
      results.push({ email: r.email, action: 'skipped-mismatch', from: user.name, to: r.newName });
      continue;
    }

    await db.user.update({ where: { id: user.id }, data: { name: r.newName } });
    await db.adminLog.create({
      data: {
        adminId: admin.id!,
        action: 'user.rename',
        targetType: 'User',
        targetId: user.id,
        metadata: { email: r.email, before: user.name, after: r.newName } as any
      }
    });
    results.push({ email: r.email, action: 'renamed', from: user.name, to: r.newName });
  }

  const ok = results.every((x) => x.action === 'renamed' || x.action === 'already-renamed');
  return NextResponse.json({ ok, results });
}
