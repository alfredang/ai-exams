/**
 * An exam's title without legacy variant suffixes — "— Practice Exam 2",
 * "(Practice Exam 1)", "· Mock Exam 3". Never split on " — " alone: in
 * official names it introduces the level ("Claude Certified Associate —
 * Foundations", "AWS Certified Developer — Associate").
 */
export function examBaseTitle(title: string): string {
  return title
    .replace(/\s+[—–-]\s+Practice Exam\s+\d+.*$/i, '')
    .replace(/\s*\(Practice Exam\s+\d+\)\s*$/i, '')
    .replace(/\s+·\s+Mock Exam\s+\d+.*$/i, '')
    .trim();
}
