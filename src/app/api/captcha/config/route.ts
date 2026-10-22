import { NextResponse } from 'next/server';
import { getCaptchaSiteKey } from '@/lib/captcha';

export const dynamic = 'force-dynamic';

// Public: the site key is meant to be embedded in the page. Served at runtime
// so an admin can switch the CAPTCHA on from Settings → Security without a rebuild.
export async function GET() {
  return NextResponse.json({ siteKey: await getCaptchaSiteKey() });
}
