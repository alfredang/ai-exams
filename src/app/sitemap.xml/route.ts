import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isExtraVariantSlug, practiceHref, practiceOnSale, voucherHref, voucherOnSale } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const u = new URL(req.url);
  const base = process.env.NEXTAUTH_URL || `${u.protocol}//${u.host}`;
  const [exams, products, vendors, pages] = await Promise.all([
    // Standalone exams only — a product's practice exam is listed via the product.
    db.exam.findMany({
      where: {
        published: true, deletedAt: null, poolExamId: null,
        questions: { some: { status: 'PUBLISHED' } },
        bundleItems: { none: { bundle: { published: true } } }
      },
      select: { slug: true, updatedAt: true, vendor: { select: { slug: true } } }
    }),
    db.bundle.findMany({
      where: { OR: [{ published: true }, { voucherPublished: true, priceVoucher: { not: null } }] },
      select: {
        slug: true, published: true, price: true, priceVoucher: true, voucherSlug: true, voucherPublished: true, updatedAt: true,
        items: { where: { tier: 'PRACTICE' }, take: 1, select: { exam: { select: { vendor: { select: { slug: true } } } } } }
      }
    }),
    db.vendor.findMany({
      where: { exams: { some: { published: true, deletedAt: null } } },
      select: { slug: true }
    }),
    db.page.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }).catch(() => [])
  ]);

  // /pricing and /faq used to live here but were never real pages — the
  // catalog itself is the pricing surface (each bundle lists its tiers)
  // and the FAQ is an in-page anchor on / (#faq), not a standalone route.
  // Listing them produced two persistent 404s in the sitemap that hurt
  // Google's trust in the rest of the URLs. Dropped 2026-05-28.
  // `lastmod` only where we know it: a guessed date teaches Google to ignore it.
  const urls: { loc: string; lastmod?: Date }[] = [
    { loc: base },
    { loc: `${base}/practice-exams` },
    { loc: `${base}/exam-vouchers` },
    { loc: `${base}/vendors` },
    ...vendors.map((v) => ({ loc: `${base}/practice-exams/${v.slug}` })),
    // Vendor Exam Voucher landing pages — only Vendors with a voucher on sale
    // (the others redirect to /exam-vouchers).
    ...[...new Set(products.filter(voucherOnSale).map((p) => p.items[0]?.exam.vendor.slug).filter(Boolean))]
      .map((v) => ({ loc: `${base}/exam-vouchers/${v}` })),
    ...products.flatMap((p) => {
      const vendor = p.items[0]?.exam.vendor.slug;
      if (!vendor) return [];
      return [
        ...(practiceOnSale(p) ? [{ loc: `${base}${practiceHref(vendor, p)}`, lastmod: p.updatedAt }] : []),
        ...(voucherOnSale(p) ? [{ loc: `${base}${voucherHref(vendor, p)}`, lastmod: p.updatedAt }] : [])
      ];
    }),
    // Those pages are noindex, so they don't belong here.
    ...exams.filter((e) => !isExtraVariantSlug(e.slug)).map((e) => ({ loc: `${base}/practice-exams/${e.vendor.slug}/${e.slug}`, lastmod: e.updatedAt })),
    ...pages.map((p: any) => ({ loc: `${base}/p/${p.slug}`, lastmod: p.updatedAt as Date }))
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod.toISOString()}</lastmod>` : ''}</url>`).join('\n')}
</urlset>`;
  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
}
