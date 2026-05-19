import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import LinkedIn from 'next-auth/providers/linkedin';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import { PrismaAdapter } from '@auth/prisma-adapter';
import argon2 from 'argon2';
import { db } from './db';
import { verifyOtp } from './otp';
import { authConfig } from './auth.config';
import { getAllSettings } from './settings';

export const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL ?? 'angch@tertiaryinfotech.com').toLowerCase().trim();
export function isSuperAdmin(email?: string | null): boolean {
  return !!email && email.toLowerCase().trim() === SUPER_ADMIN_EMAIL;
}

// Build the provider list synchronously from the env. Settings DB is read
// asynchronously inside a process-local cache so we don't block NextAuth.
let socialEnv: {
  google?: { id: string; secret: string };
  github?: { id: string; secret: string };
  linkedin?: { id: string; secret: string };
  microsoft?: { id: string; secret: string; tenant: string };
} | null = null;
async function ensureSocialEnv() {
  if (socialEnv) return socialEnv;
  try {
    const s = await getAllSettings();
    const googleOn = (s.GOOGLE_OAUTH_ENABLED || '').toLowerCase() === 'true';
    const githubOn = (s.GITHUB_OAUTH_ENABLED || '').toLowerCase() === 'true';
    const linkedinOn = (s.LINKEDIN_OAUTH_ENABLED || '').toLowerCase() === 'true';
    const microsoftOn = (s.MICROSOFT_OAUTH_ENABLED || '').toLowerCase() === 'true';
    socialEnv = {
      google: googleOn && s.GOOGLE_OAUTH_CLIENT_ID && s.GOOGLE_OAUTH_CLIENT_SECRET
        ? { id: s.GOOGLE_OAUTH_CLIENT_ID, secret: s.GOOGLE_OAUTH_CLIENT_SECRET }
        : undefined,
      github: githubOn && s.GITHUB_OAUTH_CLIENT_ID && s.GITHUB_OAUTH_CLIENT_SECRET
        ? { id: s.GITHUB_OAUTH_CLIENT_ID, secret: s.GITHUB_OAUTH_CLIENT_SECRET }
        : undefined,
      linkedin: linkedinOn && s.LINKEDIN_OAUTH_CLIENT_ID && s.LINKEDIN_OAUTH_CLIENT_SECRET
        ? { id: s.LINKEDIN_OAUTH_CLIENT_ID, secret: s.LINKEDIN_OAUTH_CLIENT_SECRET }
        : undefined,
      microsoft: microsoftOn && s.MICROSOFT_OAUTH_CLIENT_ID && s.MICROSOFT_OAUTH_CLIENT_SECRET
        ? {
            id: s.MICROSOFT_OAUTH_CLIENT_ID,
            secret: s.MICROSOFT_OAUTH_CLIENT_SECRET,
            tenant: s.MICROSOFT_OAUTH_TENANT_ID || 'common'
          }
        : undefined
    };
  } catch {
    socialEnv = {};
  }
  return socialEnv;
}

/**
 * Called by the admin settings page when an OAuth toggle is flipped, so
 * the next sign-in attempt picks up the new credentials without a redeploy.
 */
export function clearSocialEnvCache() {
  socialEnv = null;
}

// Synchronous shape — we resolve env once on module load (top-level await
// is supported in Next.js server runtime).
const initialEnv = await ensureSocialEnv();

const providers: NextAuthConfig['providers'] = [
  Credentials({
    id: 'password',
    name: 'Email + Password',
    credentials: { email: {}, password: {} },
    async authorize(creds) {
      const email = String(creds?.email || '').toLowerCase().trim();
      const password = String(creds?.password || '');
      if (!email || !password) return null;
      const user = await db.user.findUnique({ where: { email } });
      if (!user || !user.emailVerified || !user.passwordHash) return null;
      if (!user.active) return null;
      const ok = await argon2.verify(user.passwordHash, password);
      if (!ok) return null;
      return { id: user.id, email: user.email, name: user.name ?? undefined, role: user.role } as any;
    }
  }),
  Credentials({
    id: 'otp',
    name: 'Email + OTP',
    credentials: { email: {}, code: {} },
    async authorize(creds) {
      const email = String(creds?.email || '').toLowerCase().trim();
      const code = String(creds?.code || '');
      if (!email || !code) return null;
      const ok = await verifyOtp(email, code, 'LOGIN');
      if (!ok) return null;
      const user = await db.user.findUnique({ where: { email } });
      if (!user) return null;
      if (!user.active) return null;
      if (!user.emailVerified) await db.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
      return { id: user.id, email: user.email, name: user.name ?? undefined, role: user.role } as any;
    }
  })
];

if (initialEnv.google) {
  providers.push(
    Google({
      clientId: initialEnv.google.id,
      clientSecret: initialEnv.google.secret,
      // The PrismaAdapter would normally block linking when a user exists
      // with the same email but no Account row. We opt in because every
      // social provider we support verifies the email upstream.
      allowDangerousEmailAccountLinking: true
    })
  );
}
if (initialEnv.github) {
  providers.push(
    GitHub({
      clientId: initialEnv.github.id,
      clientSecret: initialEnv.github.secret,
      allowDangerousEmailAccountLinking: true
    })
  );
}
if (initialEnv.linkedin) {
  providers.push(
    LinkedIn({
      clientId: initialEnv.linkedin.id,
      clientSecret: initialEnv.linkedin.secret,
      allowDangerousEmailAccountLinking: true
    })
  );
}
if (initialEnv.microsoft) {
  providers.push(
    MicrosoftEntraID({
      clientId: initialEnv.microsoft.id,
      clientSecret: initialEnv.microsoft.secret,
      issuer: `https://login.microsoftonline.com/${initialEnv.microsoft.tenant}/v2.0`,
      allowDangerousEmailAccountLinking: true
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers,
  // For OAuth provider sign-ins the adapter creates the User. We mirror
  // the Credentials shape onto the JWT so /admin-dashboard role checks
  // continue to work without changes.
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      const base = await (authConfig.callbacks?.jwt?.({ token, user } as any) ?? token);
      if (user && (user as any).id) {
        (base as any).id = (user as any).id;
        (base as any).role = (user as any).role ?? 'USER';
      } else if (base && (base as any).id && !(base as any).role) {
        const u = await db.user.findUnique({ where: { id: (base as any).id }, select: { role: true } });
        if (u) (base as any).role = u.role;
      }
      return base;
    },
    async session({ session, token }) {
      const base = await (authConfig.callbacks?.session?.({ session, token } as any) ?? session);
      if (token && (token as any).id) {
        (base.user as any).id = (token as any).id;
        (base.user as any).role = (token as any).role ?? 'USER';
      }
      // Impersonation session-swap: when both cookies are present and the
      // signed-in user is the admin who armed them, swap the user's id +
      // role to the impersonated target. Audit Logs preserve the original
      // admin via the cookies + the impersonate.start AdminLog entry.
      try {
        const { cookies } = await import('next/headers');
        const ck = await cookies();
        const targetId = ck.get('impersonate_user_id')?.value;
        const adminId = ck.get('impersonate_admin_id')?.value;
        if (targetId && adminId && (base.user as any)?.id === adminId) {
          const target = await db.user.findUnique({
            where: { id: targetId },
            select: { id: true, email: true, name: true, role: true, active: true }
          });
          if (target && target.active) {
            (base.user as any).id = target.id;
            (base.user as any).email = target.email;
            (base.user as any).name = target.name;
            (base.user as any).role = target.role;
            (base.user as any).impersonatedBy = adminId;
          }
        }
      } catch {
        /* never break session resolution */
      }
      return base;
    }
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // First-time OAuth sign-in: mark email verified (the upstream provider
      // already did) so the user can use the password OTP fallback later
      // without re-verifying.
      if (
        isNewUser &&
        account &&
        (account.provider === 'google' ||
          account.provider === 'github' ||
          account.provider === 'linkedin' ||
          account.provider === 'microsoft-entra-id')
      ) {
        await db.user
          .update({ where: { id: user.id! }, data: { emailVerified: new Date() } })
          .catch(() => {});
      }
    }
  }
});

export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Response('Unauthorized', { status: 401 });
  return session.user as { id: string; email: string; role: 'USER' | 'ADMIN' };
}

export async function requireAdmin() {
  const u = await requireUser();
  if (u.role !== 'ADMIN') throw new Response('Forbidden', { status: 403 });
  return u;
}

/**
 * Lightweight settings probe for UI — does NOT load full provider modules.
 * Used by login/signup pages to decide whether to render the social buttons.
 */
export async function getSocialLoginEnabled(): Promise<{
  google: boolean;
  github: boolean;
  linkedin: boolean;
  microsoft: boolean;
}> {
  const env = await ensureSocialEnv();
  return {
    google: !!env.google,
    github: !!env.github,
    linkedin: !!env.linkedin,
    microsoft: !!env.microsoft
  };
}
