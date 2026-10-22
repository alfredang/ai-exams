import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const u = new URL(req.url);
  const base = process.env.NEXTAUTH_URL || `${u.protocol}//${u.host}`;
  const [exams, vendors, pages] = await Promise.all([
    db.exam.findMany({
      where: { published: true, deletedAt: null, questions: { some: { status: 'PUBLISHED' } } },
      select: { slug: true, vendor: { select: { slug: true } } }
    }),
    db.vendor.findMany({
      where: { exams: { some: { published: true, deletedAt: null } } },
      select: { slug: true }
    }),
    db.page.findMany({ where: { published: true }, select: { slug: true } }).catch(() => [])
  ]);

  // /pricing and /faq used to live here but were never real pages — the
  // catalog itself is the pricing surface (each bundle lists its tiers)
  // and the FAQ is an in-page anchor on / (#faq), not a standalone route.
  // Listing them produced two persistent 404s in the sitemap that hurt
  // Google's trust in the rest of the URLs. Dropped 2026-05-28.
  const urls = [
    base,
    `${base}/practice-exams`,
    `${base}/exam-vouchers`,
    `${base}/vendors`,
    ...vendors.map((v) => `${base}/practice-exams/${v.slug}`),
    ...exams.map((e) => `${base}/practice-exams/${e.vendor.slug}/${e.slug}`),
    ...pages.map((p: any) => `${base}/p/${p.slug}`)
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`;
  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
}
