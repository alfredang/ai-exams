/**
 * What a bundle actually contains, for display.
 *
 * A voucher bundle carries a VOUCHER `BundleItem` **pointing back at the same
 * `-p1` exam** as its first PRACTICE item. That is deliberate: `BundleItem` is
 * unique on `(bundleId, examId, tier)`, and `fulfillOrder()` walks the items to
 * decide which entitlements to grant, so the voucher needs its own row.
 *
 * It means `bundle.items` is NOT the list of practice exams, and
 * `items.length` is NOT how many practice exams a buyer gets. Counting the raw
 * items made every voucher bundle advertise one more practice exam — and one
 * exam's worth of extra questions — than it delivers (75 of 79 bundles, found
 * 2026-07-16).
 *
 * `src/lib/my-exams.ts` already models this correctly for the My Exams page:
 * "Only PRACTICE-tier entitlements show as practice exams in this bundle;
 * VOUCHER tier sets the hasVoucher flag instead." These helpers give the
 * catalog the same behaviour.
 */

type ItemLike = { tier: string; exam: { id: string; questionCount: number; _count?: { questions: number } } };

/**
 * The bundle's practice exams, in item order, deduped by exam.
 *
 * Dedupe is belt-and-braces: today only the VOUCHER row repeats an exam, and
 * the tier filter already removes it — but a bundle listing the same exam twice
 * at PRACTICE tier should still count once, because a buyer gets one exam.
 */
export function practiceItems<T extends ItemLike>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((i) => {
    if (i.tier !== 'PRACTICE') return false;
    if (seen.has(i.exam.id)) return false;
    seen.add(i.exam.id);
    return true;
  });
}

/** Distinct practice exams in the bundle — what "N practice exams" should say. */
export function practiceExamCount(items: ItemLike[]): number {
  return practiceItems(items).length;
}

/**
 * Questions in the practice exam's pool (published questions, when the query
 * selected `_count.questions`; otherwise the per-attempt count).
 */
export function practiceQuestionTotal(items: ItemLike[]): number {
  return practiceItems(items).reduce((sum, i) => sum + (i.exam._count?.questions ?? i.exam.questionCount), 0);
}

/** Catalog card line, e.g. "390-question pool · 65 per attempt". */
export function poolCardLabel(items: ItemLike[]): string {
  const exam = practiceItems(items)[0]?.exam;
  if (!exam) return '';
  const pool = practiceQuestionTotal(items);
  return `${pool}-question pool · ${Math.min(exam.questionCount, pool)} per attempt`;
}

/** Prisma include for a product's items with each exam's published-question count. */
export const PUBLISHED_QUESTION_COUNT = { _count: { select: { questions: { where: { status: 'PUBLISHED' as const } } } } };

/** "1 practice exam" / "6 practice exams" — the plural was hardcoded in the catalog. */
export function practiceExamLabel(count: number): string {
  return `${count} practice exam${count === 1 ? '' : 's'}`;
}
