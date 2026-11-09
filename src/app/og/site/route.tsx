import { ImageResponse } from 'next/og';

// 1200×630 social card for every page without its own product card: homepage,
// catalogs, Vendor pages. Deliberately NOT under /api/ — robots.txt disallows
// /api/, and crawlers must be able to fetch it.
export const runtime = 'nodejs';

export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #132f73 0%, #1d5bf0 100%)', color: 'white', padding: '60px 70px', fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 30, fontWeight: 700 }}>
          <div style={{ width: 48, height: 48, borderRadius: 10, background: 'white', color: '#132f73', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>E</div>
          Tertiary Exams
        </div>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, lineHeight: 1.08, maxWidth: 1040 }}>
          Practice Exams and Exam Vouchers in Singapore
        </div>
        <div style={{ display: 'flex', fontSize: 26, opacity: 0.85 }}>
          AWS · Microsoft · Claude · CompTIA · Cisco · Kubernetes · exams.tertiaryinfotech.com
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' } }
  );
}
