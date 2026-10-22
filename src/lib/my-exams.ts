import type { Tier } from '@prisma/client';
import { db } from './db';
import { getAttemptHistory, type ExamHistory } from './attempt-history';

export type ExamRow = {
  entitlementId: string;
  examId: string;
  examSlug: string;
  examTitle: string;
  examCode: string;
  questionCount: number;
  durationMinutes: number;
  vendorName: string;
  vendorSlug: string;
  tier: Tier;
  grantedAt: Date;
};

export type BundleGroup = {
  bundleId: string;
  bundleSlug: string;
  bundleTitle: string;
  bundleDescription: string;
  vendorName: string;
  vendorSlug: string;
  code: string;       // e.g. "AI-900" — stripped of any -P\d+ suffix from items[0]
  level: string;      // from items[0].exam.level
  items: ExamRow[];   // practice-tier entitlements the user owns from this bundle
  hasVoucher: boolean;
  grantedAt: Date;    // earliest grant date in the group
};

export type GroupedExams = {
  bundles: BundleGroup[];
  standalone: ExamRow[];
};

// Unified card item for the My Exams list UI. Server pages build this
// shape and pass it to the <MyExamsList> client component.
export type MyExamsListItem =
  | { kind: 'bundle'; data: BundleGroup }
  | { kind: 'standalone'; data: ExamRow };

/**
 * Group items by kind for the My Exams display: bundle cards first, then
 * standalone cards. Within each group, items are sorted newest-first by
 * grantedAt. Bundles lead because they can expand to span two columns —
 * mixing them with single-column standalones broke the grid visually.
 * Server-safe (no React imports) so server pages can call it directly
 * before passing the result to <MyExamsList>.
 */
export function toListItems(grouped: GroupedExams): MyExamsListItem[] {
  const bundleItems: MyExamsListItem[] = grouped.bundles
    .slice()
    .sort((a, b) => b.grantedAt.getTime() - a.grantedAt.getTime())
    .map(b => ({ kind: 'bundle' as const, data: b }));
  const standaloneItems: MyExamsListItem[] = grouped.standalone
    .slice()
    .sort((a, b) => b.grantedAt.getTime() - a.grantedAt.getTime())
    .map(s => ({ kind: 'standalone' as const, data: s }));
  return [...bundleItems, ...standaloneItems];
}

/**
 * Groups a user's entitlements by the Bundle they came from.
 *
 * When a user buys a bundle (e.g. AI-900), fulfillOrder() writes one
 * Entitlement per BundleItem — 6 rows for a 6-variant bundle. Rendering
 * each as a separate card is noisy, so the dashboard collapses them
 * into a single expandable bundle card. Entitlements whose exam is not
 * part of any published bundle are returned as `standalone`.
 *
 * Ordering: bundles + standalones are returned separately; consumers
 * usually want to interleave them by `grantedAt` for display. Both
 * lists are sorted newest-first.
 */
export async function getGroupedExams(userId: string): Promise<GroupedExams> {
  const [entitlements, bundles] = await Promise.all([
    db.entitlement.findMany({
      where: { userId },
      include: { exam: { include: { vendor: true, poolExam: { include: { vendor: true } } } } },
      orderBy: { grantedAt: 'desc' }
    }),
    db.bundle.findMany({
      where: { published: true },
      include: { items: { orderBy: { position: 'asc' } } }
    })
  ]);

  // examId -> bundleId. An exam can appear under one bundle in our data
  // model (Bundle.items has @@unique([bundleId, examId, tier]) so an
  // exam can technically be in multiple bundles, but in practice each
  // cert family has exactly one bundle).
  const examToBundle = new Map<string, string>();
  for (const b of bundles) {
    for (const it of b.items) {
      examToBundle.set(it.examId, b.id);
    }
  }

  // Working buckets keyed by bundleId so we can populate items in order.
  const bundleBuckets = new Map<string, BundleGroup>();
  const standalone: ExamRow[] = [];

  // An entitlement on a retired "Practice Exam N" variant unlocks the
  // certification's pool exam, so show (and dedupe) it as that exam.
  const seenPractice = new Set<string>();
  for (const e of entitlements) {
    const exam = e.exam.poolExam ?? e.exam;
    if (e.tier !== 'VOUCHER') {
      if (seenPractice.has(exam.id)) continue;
      seenPractice.add(exam.id);
    }
    const row: ExamRow = {
      entitlementId: e.id,
      examId: exam.id,
      examSlug: exam.slug,
      examTitle: exam.title,
      examCode: exam.code,
      questionCount: exam.questionCount,
      durationMinutes: exam.durationMinutes,
      vendorName: exam.vendor.name,
      vendorSlug: exam.vendor.slug,
      tier: e.tier,
      grantedAt: e.grantedAt
    };

    const bundleId = examToBundle.get(exam.id);
    if (!bundleId) {
      standalone.push(row);
      continue;
    }

    let group = bundleBuckets.get(bundleId);
    if (!group) {
      const b = bundles.find(x => x.id === bundleId)!;
      const firstItem = b.items[0];
      // Look up the first item's exam from the entitlements we already loaded.
      // Fallback to row.* when the user only owns one item.
      const firstExam = entitlements.find(en => en.examId === firstItem.examId)?.exam ?? exam;
      group = {
        bundleId: b.id,
        bundleSlug: b.slug,
        bundleTitle: b.title,
        bundleDescription: b.description,
        vendorName: firstExam.vendor.name,
        vendorSlug: firstExam.vendor.slug,
        code: firstExam.code.replace(/-P\d+$/, ''),
        level: firstExam.level,
        items: [],
        hasVoucher: false,
        grantedAt: e.grantedAt
      };
      bundleBuckets.set(bundleId, group);
    }

    // Only PRACTICE-tier entitlements show as "practice exams in this bundle";
    // VOUCHER tier sets the hasVoucher flag instead (rendered as a green
    // strip when expanded).
    if (row.tier === 'VOUCHER') {
      group.hasVoucher = true;
    } else {
      group.items.push(row);
    }
    // Track earliest grant date for sorting.
    if (e.grantedAt < group.grantedAt) group.grantedAt = e.grantedAt;
  }

  // Sort bundle items by their position in the Bundle (P1 before P2 ...).
  // Use the bundles list we already loaded to get the canonical order.
  for (const [bundleId, group] of bundleBuckets) {
    const positions = new Map<string, number>();
    const b = bundles.find(x => x.id === bundleId)!;
    for (const it of b.items) positions.set(it.examId, it.position);
    group.items.sort((a, b) => (positions.get(a.examId) ?? 0) - (positions.get(b.examId) ?? 0));
  }

  // Drop bundles where the user has NO PRACTICE-tier entitlements (only a
  // voucher) — in that case the voucher already shows in /user-dashboard/vouchers
  // and there's no exam content to expand.
  const finalBundles = [...bundleBuckets.values()].filter(g => g.items.length > 0);
  finalBundles.sort((a, b) => b.grantedAt.getTime() - a.grantedAt.getTime());
  standalone.sort((a, b) => b.grantedAt.getTime() - a.grantedAt.getTime());

  return { bundles: finalBundles, standalone };
}

export type PracticeBadge = {
  examId: string;      // pool exam — what the one-click start runs
  code: string;
  title: string;
  vendorName: string;
  questionCount: number;
  durationMinutes: number;
  attemptsTaken: number;
  lastScore: number | null;
  bestScore: number | null;
  inProgress: boolean; // an unfinished practice attempt will be resumed
};

/**
 * One badge per practice exam the user can take, for the dashboard's
 * click-to-start grid. Voucher-only rows are left out (no practice access
 * shown there); progress comes from the same attempt history the Attempts
 * page shows, so the numbers always agree.
 */
export async function getPracticeBadges(
  userId: string,
  history?: { exams: ExamHistory[] }
): Promise<PracticeBadge[]> {
  const [g, h] = await Promise.all([getGroupedExams(userId), history ?? getAttemptHistory(userId)]);
  const rows: { row: ExamRow; title: string; code: string }[] = [
    ...g.bundles.map((b) => ({ row: b.items[0], title: b.bundleTitle, code: b.code })),
    ...g.standalone
      .filter((r) => r.tier !== 'VOUCHER')
      .map((r) => ({ row: r, title: r.examTitle, code: r.examCode.replace(/-P\d+$/, '') }))
  ];

  return rows
    .map(({ row, title, code }) => {
      const exam = h.exams.find((e) => e.examId === row.examId);
      const scored = exam?.attempts.filter((a) => a.score !== null) ?? [];
      return {
        examId: row.examId,
        code,
        title,
        vendorName: row.vendorName,
        questionCount: row.questionCount,
        durationMinutes: row.durationMinutes,
        attemptsTaken: scored.length,
        lastScore: exam?.latest ?? null,
        bestScore: exam?.best ?? null,
        inProgress: !!exam?.attempts.some((a) => a.inProgress && a.mode === 'PRACTICE' && !a.isTeaser)
      };
    })
    .sort((a, b) => a.code.localeCompare(b.code));
}
