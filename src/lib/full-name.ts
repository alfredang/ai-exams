import { redirect } from 'next/navigation';
import { db } from './db';

export { isFullName, normalizeName } from './full-name-rules';
import { isFullName } from './full-name-rules';

/**
 * Customers must have a full name on file before a full (non-teaser) attempt.
 * Staff accounts and impersonated sessions are never stopped here.
 */
export async function needsFullName(userId: string, impersonatedBy?: string | null): Promise<boolean> {
  if (impersonatedBy) return false;
  const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, role: true } });
  return !!user && user.role === 'USER' && !isFullName(user.name);
}

/**
 * What stops a customer from starting a full (non-teaser) attempt: an email
 * address they haven't verified, then a missing full name. Both are handled
 * by /complete-profile. Staff and impersonated sessions are never stopped.
 */
export async function startBlocker(userId: string, impersonatedBy?: string | null): Promise<'email' | 'name' | null> {
  if (impersonatedBy) return null;
  const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, role: true, emailVerified: true } });
  if (!user || user.role !== 'USER') return null;
  if (!user.emailVerified) return 'email';
  return isFullName(user.name) ? null : 'name';
}

/** Send the customer to /complete-profile; it starts (or resumes) this exam afterwards. */
export async function requireProfileToStart(
  session: { user?: unknown } | null,
  examId: string,
  mode: 'PRACTICE' | 'EXAM'
) {
  const user = session?.user as { id?: string; impersonatedBy?: string } | undefined;
  if (user?.id && await startBlocker(user.id, user.impersonatedBy)) {
    redirect(`/complete-profile?examId=${encodeURIComponent(examId)}&mode=${mode}`);
  }
}
