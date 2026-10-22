import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSetting } from '@/lib/settings';
import { getPublicOrigin, publicUrl } from '@/lib/url';

export const dynamic = 'force-dynamic';

// The transport sends over SMTP XOAUTH2, which rejects gmail.send — it needs
// the full mail scope (same as the service-account transport in lib/mail.ts).
const SCOPE = 'https://mail.google.com/';

function callbackUrl(req: Request): string {
  // Must match the OAuth client's registered redirect URI exactly.
  return `${getPublicOrigin(req)}/api/admin/gmail-oauth/callback`;
}

export async function GET(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const clientId = await getSetting('GMAIL_OAUTH_CLIENT_ID');
  if (!clientId) {
    return NextResponse.redirect(
      publicUrl(req, '/admin-dashboard/settings/email?error=missing_client_id')
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl(req),
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true'
  });
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
