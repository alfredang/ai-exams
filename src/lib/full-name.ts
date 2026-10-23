import { redirect } from 'next/navigation';
import { db } from './db';

// Words that are never a real name on their own: admin-created accounts start
// as "user", and people type these to get past a name box.
const PLACEHOLDER_WORDS = new Set([
  'user', 'test', 'admin', 'name', 'student', 'guest', 'customer', 'candidate',
  'na', 'n/a', 'none', 'null', 'unknown', 'abc', 'xyz', 'asdf', 'first', 'last'
]);

/**
 * A full name for score reports and vouchers: at least two words (first and
 * last name), letters only plus spaces, hyphens, apostrophes and dots, and
 * not a placeholder such as "user" or "Test User".
 */
export function isFullName(name: string | null | undefined): boolean {
  const n = normalizeName(name);
  if (n.length < 3 || n.length > 120) return false;
  if (!/^[\p{L}\p{M}][\p{L}\p{M}'’.\- ]*$/u.test(n)) return false;
  const words = n.split(' ').filter(w => /\p{L}/u.test(w));
  if (words.length < 2) return false;
  if (words.every(w => PLACEHOLDER_WORDS.has(w.toLowerCase().replace(/\.$/, '')))) return false;
  return true;
}

export function normalizeName(name: string | null | undefined): string {
  return (name ?? '').trim().replace(/\s+/g, ' ');
}

/**
 * Customers must have a full name on file before a full (non-teaser) attempt.
 * Staff accounts and impersonated sessions are never stopped here.
 */
export async function needsFullName(userId: string, impersonatedBy?: string | null): Promise<boolean> {
  if (impersonatedBy) return false;
  const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, role: true } });
  return !!user && user.role === 'USER' && !isFullName(user.name);
}

/** Send the customer to the name form; it starts (or resumes) this exam afterwards. */
export async function requireFullNameToStart(
  session: { user?: unknown } | null,
  examId: string,
  mode: 'PRACTICE' | 'EXAM'
) {
  const user = session?.user as { id?: string; impersonatedBy?: string } | undefined;
  if (user?.id && await needsFullName(user.id, user.impersonatedBy)) {
    redirect(`/complete-profile?examId=${encodeURIComponent(examId)}&mode=${mode}`);
  }
}
