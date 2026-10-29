import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { appCallback, isCodeChallenge, issueHandoffCode } from '@/lib/mobile-auth';

/**
 * Google sign-in for the native apps, step 2: NextAuth lands here after the
 * Google callback with a web session. We hand the app a short-lived code bound
 * to its PKCE challenge (see issueHandoffCode); the app redeems it at
 * /api/mobile/auth/google/exchange for the usual mobile token.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const challenge = url.searchParams.get('cc');
  const rawState = url.searchParams.get('state') || '';
  const state = /^[A-Za-z0-9_-]{0,64}$/.test(rawState) ? rawState : '';
  if (!isCodeChallenge(challenge)) return appCallback({ error: 'Invalid sign-in request.', state });

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return appCallback({ error: 'Google sign-in was not completed.', state });

  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, active: true } });
  if (!user?.active) return appCallback({ error: 'This account is not available.', state });

  return appCallback({ code: issueHandoffCode(user.id, challenge), state });
}
