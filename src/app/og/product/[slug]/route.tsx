import { ImageResponse } from 'next/og';
import { db } from '@/lib/db';
import { displayExamCode, practiceOnSale, voucherOnSale, voucherTitleFor } from '@/lib/products';

// 1200×630 product card used as the Product JSON-LD `image` and the OG image
// for Practice Exam / Exam Voucher pages. Deliberately NOT under /api/ —
// robots.txt disallows /api/ and Google must crawl product images.
export const runtime = 'nodejs';

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const voucher = new URL(req.url).searchParams.get('tier') === 'voucher';
  const bundle = await db.bundle.findUnique({
    where: { slug },
    select: {
      title: true, voucherTitle: true, published: true, voucherPublished: true, price: true, priceVoucher: true,
      items: { orderBy: { position: 'asc' }, select: { tier: true, exam: { select: { code: true, level: true, vendor: { select: { name: true } } } } } }
    }
  });
  const exam = bundle && (bundle.items.find((i) => i.tier === 'PRACTICE') ?? bundle.items[0])?.exam;
  if (!bundle || !exam || !(voucher ? voucherOnSale(bundle) : practiceOnSale(bundle))) {
    return new Response('Not found', { status: 404 });
  }

  const title = voucher ? voucherTitleFor(bundle) : `${bundle.title} Practice Exam`;
  const label = voucher ? 'Official Exam Voucher' : 'Practice Exam';
  const bg = voucher
    ? 'linear-gradient(135deg, #064e3b 0%, #059669 100%)'
    : 'linear-gradient(135deg, #132f73 0%, #1d5bf0 100%)';

  return new ImageResponse(
    (
      <div style={{
        height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        background: bg, color: 'white', padding: '60px 70px', fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 30, fontWeight: 700 }}>
          <div style={{ width: 48, height: 48, borderRadius: 10, background: 'white', color: '#132f73', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>E</div>
          Tertiary Exams
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 14, fontSize: 26, marginBottom: 18 }}>
            <span style={{ display: 'flex', background: 'rgba(255,255,255,0.18)', borderRadius: 999, padding: '6px 18px' }}>{label}</span>
            <span style={{ display: 'flex', background: 'rgba(255,255,255,0.18)', borderRadius: 999, padding: '6px 18px' }}>{exam.vendor.name}</span>
            <span style={{ display: 'flex', background: 'rgba(255,255,255,0.18)', borderRadius: 999, padding: '6px 18px' }}>{displayExamCode(exam.code)}</span>
          </div>
          <div style={{ display: 'flex', fontSize: 58, fontWeight: 800, lineHeight: 1.1, maxWidth: 1060 }}>{title}</div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, opacity: 0.85 }}>
          {voucher ? 'Practice exam included free · exams.tertiaryinfotech.com' : 'Blueprint-aligned questions with explanations · exams.tertiaryinfotech.com'}
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' } }
  );
}
