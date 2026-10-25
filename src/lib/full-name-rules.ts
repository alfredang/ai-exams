// Pure name rules, safe to import from client components (signup, teaser
// gate). Server gates live in ./full-name.

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
