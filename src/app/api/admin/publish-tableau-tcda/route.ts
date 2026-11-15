import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { voucherPriceWithGst } from '@/lib/currency';

export const runtime = 'nodejs';

/**
 * One-shot admin endpoint: publish the Tableau Certified Data Analyst
 * (`tableau-tcda`) bundle on prod.
 *
 * The bundle + its 6×65 published questions already exist on prod; it was just
 * never `published=true`. The seed deliberately never sets `published` on
 * existing bundles, so this flag has to be flipped once by hand. After the
 * seed change that registers `tableau-tcda` in buildMultiVariantBundles, the
 * bundle is in `seededSlugs`, so the auto-unpublish pass no longer hides it —
 * this publish therefore sticks across future deploys.
 *
 * Idempotent (no-op if already published) and guarded: refuses to publish if
 * the bundle is missing, has no items, or any member exam is archived/empty.
 * Writes an AdminLog.
 */
export async function POST() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const SLUG = 'tableau-tcda';
  const bundle = await db.bundle.findUnique({
    where: { slug: SLUG },
    include: {
      items: {
        orderBy: { position: 'asc' },
        include: {
          exam: {
            select: {
              slug: true,
              published: true,
              deletedAt: true,
              _count: { select: { questions: { where: { status: 'PUBLISHED' } } } }
            }
          }
        }
      }
    }
  });

  if (!bundle) {
    return NextResponse.json({ error: `bundle '${SLUG}' not found (deploy the seed change first)` }, { status: 404 });
  }

  // Guard: don't publish a broken product.
  const badItems = bundle.items.filter(
    (it) => !it.exam.published || it.exam.deletedAt != null || it.exam._count.questions === 0
  );
  if (bundle.items.length === 0 || badItems.length > 0) {
    return NextResponse.json(
      {
        error: 'refusing to publish — bundle has no items or has archived/empty member exams',
        items: bundle.items.length,
        badItems: badItems.map((it) => ({ slug: it.exam.slug, published: it.exam.published, archived: it.exam.deletedAt != null, publishedQuestions: it.exam._count.questions }))
      },
      { status: 409 }
    );
  }

  const wasPublished = bundle.published;
  if (!wasPublished) {
    await db.bundle.update({ where: { id: bundle.id }, data: { published: true } });
    await db.adminLog.create({
      data: {
        adminId: user.id!,
        action: 'publish.tableau_tcda',
        targetType: 'Bundle',
        targetId: bundle.id,
        metadata: { slug: SLUG, from: false, to: true, items: bundle.items.length }
      }
    });
  }

  return NextResponse.json({
    ok: true,
    slug: SLUG,
    alreadyPublished: wasPublished,
    nowPublished: true,
    price: bundle.price,
    priceVoucher: voucherPriceWithGst(bundle.priceVoucher),
    items: bundle.items.map((it) => ({ slug: it.exam.slug, tier: it.tier, publishedQuestions: it.exam._count.questions }))
  });
}
