import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * Flush the ISR cache for the public catalog pages.
 *
 * Why this exists: `/practice-exams/[vendor]` is ISR with `revalidate = 300`
 * and a very long stale-while-revalidate window. After seeding a bundle
 * straight into the database (e.g. POST /api/admin/seed-cysa), the vendor
 * catalog keeps serving its prerendered snapshot until a request happens to
 * trip it to STALE and a background regeneration completes — observed at
 * ~20 minutes on 2026-08-20 for the CySA+ launch, during which the bundle
 * detail page was live but the vendor listing did not show it.
 *
 * The seed endpoints write directly with Prisma, so Next has no idea the
 * data changed. This gives us an explicit purge to call afterwards.
 *
 * POST /api/admin/revalidate            -> catalog roots + every vendor page
 * POST /api/admin/revalidate?vendor=xyz -> that vendor page only
 *
 * Admin-only, and safe to call repeatedly.
 */
export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const vendor = new URL(req.url).searchParams.get('vendor');
  const paths = ['/practice-exams', '/vendors', '/'];

  if (vendor) {
    paths.push(`/practice-exams/${vendor}`);
  } else {
    const vendors = await db.vendor.findMany({ select: { slug: true } });
    for (const v of vendors) paths.push(`/practice-exams/${v.slug}`);
  }

  for (const p of paths) revalidatePath(p);

  await db.adminLog.create({
    data: {
      adminId: user.id!,
      action: 'cache.revalidate',
      targetType: 'Path',
      targetId: vendor ?? 'all-vendors',
      metadata: { paths }
    }
  });

  return NextResponse.json({ ok: true, revalidated: paths });
}
