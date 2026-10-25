/**
 * Domain-weighted question pool.
 *
 * Each certification sells ONE practice exam. Its questions form a pool
 * grouped by `Question.domain`, and every attempt — practice, exam mode, the
 * free teaser and every retake — is a fresh random draw from that pool in
 * proportion to the official blueprint weights in `Exam.domains`.
 *
 * Retired "Practice Exam N" variants point at the pool exam via
 * `Exam.poolExamId`; `resolvePoolExam()` follows that pointer so old links,
 * old entitlements and "Retake exam" on old attempts land on the pool.
 */
import type { PrismaClient } from '@prisma/client';

export type BlueprintDomain = { name: string; weight: number };

/** Case/punctuation-insensitive key so "Security & Compliance" matches "Security and Compliance". */
export function domainKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function parseDomains(raw: unknown): BlueprintDomain[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((d): d is { name: string; weight: unknown } => !!d && typeof (d as any).name === 'string')
    .map((d) => ({ name: d.name, weight: Math.max(0, Number(d.weight) || 0) }));
}

/** Blueprint domain name a question's `domain` label belongs to, or null if it matches none. */
export function matchDomain(label: string, domains: BlueprintDomain[]): string | null {
  const exact = domains.find((d) => d.name === label);
  if (exact) return exact.name;
  const key = domainKey(label);
  return domains.find((d) => domainKey(d.name) === key)?.name ?? null;
}

/**
 * How many questions each domain contributes to one attempt of `count`
 * questions, given how many are available per domain.
 *
 * Largest-remainder apportionment of the blueprint weights, capped by what
 * each domain actually has; any shortfall is re-apportioned across the
 * domains that still have spare questions. Returns domain name → count.
 */
export function planAllocation(
  domains: BlueprintDomain[],
  available: Record<string, number>,
  count: number
): Record<string, number> {
  const plan: Record<string, number> = Object.fromEntries(domains.map((d) => [d.name, 0]));
  let remaining = count;
  // Each round apportions every remaining seat across the domains that still
  // have spare questions, then caps by what they have. A round either places
  // every seat or closes at least one domain, so it ends within domains.length rounds.
  while (remaining > 0) {
    const open = domains.filter((d) => (available[d.name] ?? 0) > plan[d.name]);
    if (open.length === 0) break;
    const totalWeight = open.reduce((s, d) => s + d.weight, 0);
    const shares = open.map((d, i) => {
      const exact = totalWeight > 0 ? (remaining * d.weight) / totalWeight : remaining / open.length;
      return { name: d.name, i, exact, seats: Math.floor(exact) };
    });
    let leftover = remaining - shares.reduce((s, x) => s + x.seats, 0);
    // Largest remainder first; ties go to the domain listed first.
    for (const s of [...shares].sort((a, b) => (b.exact - b.seats) - (a.exact - a.seats) || a.i - b.i)) {
      if (leftover === 0) break;
      s.seats++;
      leftover--;
    }
    for (const s of shares) {
      const take = Math.min(s.seats, (available[s.name] ?? 0) - plan[s.name]);
      plan[s.name] += take;
      remaining -= take;
    }
  }
  return plan;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type PoolQuestion = { id: string; domain: string; isTeaser?: boolean };

/**
 * Pure draw: pick `count` question ids from `questions` following the
 * blueprint. Questions whose domain matches no blueprint domain only fill
 * seats the blueprint domains cannot. Result order is shuffled.
 */
export function drawFromPool(questions: PoolQuestion[], domains: BlueprintDomain[], count: number): string[] {
  const n = Math.min(count, questions.length);
  if (domains.length === 0 || domains.every((d) => d.weight === 0)) {
    return shuffle(questions).slice(0, n).map((q) => q.id);
  }
  const buckets = new Map<string, PoolQuestion[]>(domains.map((d) => [d.name, []]));
  const unmatched: PoolQuestion[] = [];
  for (const q of questions) {
    const name = matchDomain(q.domain, domains);
    if (name) buckets.get(name)!.push(q);
    else unmatched.push(q);
  }
  const available = Object.fromEntries([...buckets].map(([k, v]) => [k, v.length]));
  const plan = planAllocation(domains, available, n);
  const picked: string[] = [];
  const leftovers: PoolQuestion[] = [];
  for (const [name, qs] of buckets) {
    const mixed = shuffle(qs);
    picked.push(...mixed.slice(0, plan[name]).map((q) => q.id));
    leftovers.push(...mixed.slice(plan[name]));
  }
  if (picked.length < n) {
    picked.push(...shuffle([...unmatched, ...leftovers]).slice(0, n - picked.length).map((q) => q.id));
  }
  return shuffle(picked);
}

/** The exam that owns the question pool for `examId` (itself, or the exam a retired variant points at). */
export async function resolvePoolExam(db: PrismaClient, examId: string) {
  const exam = await db.exam.findUnique({ where: { id: examId }, include: { poolExam: true } });
  if (!exam) return null;
  return exam.poolExam ?? exam;
}

/** Exam ids whose entitlements unlock the pool exam: the pool exam plus its retired variants. */
export async function poolAccessExamIds(db: PrismaClient, poolExamId: string): Promise<string[]> {
  const variants = await db.exam.findMany({ where: { poolExamId }, select: { id: true } });
  return [poolExamId, ...variants.map((v) => v.id)];
}

/** Tiers that unlock the full practice exam. A voucher purchase includes the practice exam. */
export const PRACTICE_ACCESS_TIERS = ['PRACTICE', 'BUNDLE', 'VOUCHER', 'ADMIN_GRANT'] as const;

export async function hasPracticeAccess(db: PrismaClient, userId: string, poolExamId: string): Promise<boolean> {
  const examIds = await poolAccessExamIds(db, poolExamId);
  const ent = await db.entitlement.findFirst({
    where: { userId, examId: { in: examIds }, tier: { in: [...PRACTICE_ACCESS_TIERS] } },
    select: { id: true }
  });
  return !!ent;
}

/**
 * Draw a fresh attempt's question ids for a pool exam. The free teaser
 * draws from the same whole pool as the paid exam (just fewer questions),
 * so every teaser is a different domain-weighted sample — `isTeaser` flags
 * no longer restrict it.
 */
export async function drawAttemptQuestions(
  db: PrismaClient,
  exam: { id: string; domains: unknown; questionCount: number },
  opts: { teaser?: boolean; count?: number } = {}
): Promise<string[]> {
  const domains = parseDomains(exam.domains);
  const all = await db.question.findMany({
    where: { examId: exam.id, status: 'PUBLISHED' },
    select: { id: true, domain: true }
  });
  return drawFromPool(all, domains, opts.count ?? exam.questionCount);
}

/** Per-domain pool size and per-attempt allocation, for the admin pool view. */
export async function poolStats(db: PrismaClient, exam: { id: string; domains: unknown; questionCount: number }) {
  const domains = parseDomains(exam.domains);
  const groups = await db.question.groupBy({
    by: ['domain'],
    where: { examId: exam.id, status: 'PUBLISHED' },
    _count: { _all: true }
  });
  const available: Record<string, number> = Object.fromEntries(domains.map((d) => [d.name, 0]));
  const unmatched: { domain: string; count: number }[] = [];
  for (const g of groups) {
    const name = matchDomain(g.domain, domains);
    if (name) available[name] += g._count._all;
    else unmatched.push({ domain: g.domain, count: g._count._all });
  }
  const total = groups.reduce((s, g) => s + g._count._all, 0);
  const plan = planAllocation(domains, available, Math.min(exam.questionCount, total));
  return {
    total,
    rows: domains.map((d) => ({ name: d.name, weight: d.weight, pool: available[d.name], perAttempt: plan[d.name] })),
    unmatched
  };
}
