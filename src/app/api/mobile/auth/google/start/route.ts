import { NextResponse } from 'next/server';
import { getSocialLoginEnabled, signIn } from '@/lib/auth';
import { appCallback, isCodeChallenge } from '@/lib/mobile-auth';
import { rateLimit } from '@/lib/ratelimit';
import { clientIp } from '@/lib/client-ip';

/**
 * Google sign-in for the native apps, step 1. The app opens this URL in an
 * ephemeral system auth browser (ASWebAuthenticationSession) with a PKCE
 * `code_challenge` (base64url SHA-256 of a random verifier). We start the
 * website's own NextAuth Google flow — same OAuth client and redirect URI as
 * the web login — and send it back to /complete afterwards.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const challenge = url.searchParams.get('code_challenge');
  const state = url.searchParams.get('state') || '';
  if (!isCodeChallenge(challenge) || !/^[A-Za-z0-9_-]{0,64}$/.test(state)) {
    return NextResponse.json({ error: 'Invalid sign-in request.' }, { status: 400 });
  }
  if (!rateLimit(`mobile-google:ip:${clientIp(req.headers)}`, 30, 60 * 60_000).ok) {
    return appCallback({ error: 'Too many sign-in attempts. Please try again later.', state });
  }
  if (!(await getSocialLoginEnabled()).google) {
    return appCallback({ error: 'Google sign-in is not available right now.', state });
  }

  const next = new URLSearchParams({ cc: challenge, state });
  const redirectUrl = await signIn('google', {
    redirect: false,
    redirectTo: `/api/mobile/auth/google/complete?${next}`
  });
  return NextResponse.redirect(redirectUrl);
}
