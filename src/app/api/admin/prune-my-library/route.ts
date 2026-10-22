import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { poolAccessExamIds } from '@/lib/question-pool';

export const runtime = 'nodejs';

/**
 * One-shot admin endpoint: trim the SIGNED-IN admin's own practice library
 * (/user-dashboard/exams) down to the products in KEEP_PRODUCTS.
 *
 * Dry run by default — POST `?apply=1` to delete. Practice-type entitlements
 * (PRACTICE / BUNDLE / ADMIN_GRANT) on any other exam are removed; each kept
 * product's pool exam gets an ADMIN_GRANT if the account has no practice
 * access to it yet. VOUCHER entitlements hold real exam codes, so they are
 * only reported, never deleted. Attempts and orders are untouched.
 */

const KEEP_PRODUCTS = ['anthropic-ccao-foundations', 'linuxfoundation-cka', 'linuxfoundation-ckad'];

export async function POST(req: Request) {
  const session = await auth();
  const admin = session?.user as { id?: string; role?: string; email?: string } | undefined;
  if (admin?.role !== 'ADMIN' || !admin.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const apply = new URL(req.url).searchParams.get('apply') === '1';

  const bundles = await db.bundle.findMany({
    where: { slug: { in: KEEP_PRODUCTS } },
    include: { items: true }
  });
  const missing = KEEP_PRODUCTS.filter((slug) => !bundles.some((b) => b.slug === slug));
  if (missing.length > 0) {
    return NextResponse.json({ error: 'products not found', missing }, { status: 404 });
  }

  // Every exam id that unlocks a kept product: its items plus their retired variants.
  const keepIds = new Set<string>();
  const poolExamIds: string[] = [];
  for (const b of bundles) {
    const practice = b.items.find((i) => i.tier === 'PRACTICE') ?? b.items[0];
    if (practice) poolExamIds.push(practice.examId);
    for (const item of b.items) {
      for (const id of await poolAccessExamIds(db, item.examId)) keepIds.add(id);
    }
  }

  const entitlements = await db.entitlement.findMany({
    where: { userId: admin.id },
    include: { exam: { select: { slug: true, title: true } } }
  });
  const describe = (e: (typeof entitlements)[number]) => ({ exam: e.exam.slug, title: e.exam.title, tier: e.tier });
  const outside = entitlements.filter((e) => !keepIds.has(e.examId));
  const toDelete = outside.filter((e) => e.tier !== 'VOUCHER');
  const vouchersKept = outside.filter((e) => e.tier === 'VOUCHER');
  const kept = entitlements.filter((e) => keepIds.has(e.examId));

  const toGrant: string[] = [];
  for (const poolExamId of poolExamIds) {
    const ids = await poolAccessExamIds(db, poolExamId);
    if (!kept.some((e) => ids.includes(e.examId))) toGrant.push(poolExamId);
  }

  if (apply) {
    await db.$transaction([
      db.entitlement.deleteMany({ where: { id: { in: toDelete.map((e) => e.id) } } }),
      ...toGrant.map((examId) =>
        db.entitlement.upsert({
          where: { userId_examId_tier: { userId: admin.id!, examId, tier: 'ADMIN_GRANT' } },
          update: {},
          create: { userId: admin.id!, examId, tier: 'ADMIN_GRANT' }
        })
      ),
      db.adminLog.create({
        data: {
          adminId: admin.id,
          action: 'user.prune-library',
          targetType: 'User',
          targetId: admin.id,
          metadata: {
            keepProducts: KEEP_PRODUCTS,
            deleted: toDelete.map(describe),
            granted: toGrant
          }
        }
      })
    ]);
  }

  return NextResponse.json({
    ok: true,
    applied: apply,
    user: admin.email,
    keepProducts: KEEP_PRODUCTS,
    deleteCount: toDelete.length,
    delete: toDelete.map(describe),
    keep: kept.map(describe),
    vouchersKept: vouchersKept.map(describe),
    grant: toGrant
  });
}
