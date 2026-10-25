/**
 * Instructor-led exam prep courses on tertiarycourses.com.sg, keyed by
 * product (Bundle) slug. Shown as a card on the Practice Exam and Exam
 * Voucher pages; products without an entry show no card.
 *
 * Only courses that prepare for the same exam belong here — checked live on
 * 2026-10-25. Scope is CompTIA, Linux Foundation, PMI (PMP), Microsoft,
 * ITIL 4 and Anthropic (CCAO-F, CCAR-F).
 *
 * `scheme` is set only for funded WSQ / CASL courses; leave it out for a
 * non-WSQ course so the card makes no funding claim.
 */
export type InstructorLedCourse = {
  url: string;
  scheme?: 'WSQ' | 'CASL';
};

const TC = 'https://www.tertiarycourses.com.sg';

export const INSTRUCTOR_LED_COURSES: Record<string, InstructorLedCourse> = {
  // CompTIA
  'comptia-a-plus': { url: `${TC}/wsq-comptia-certified-a-training-core-1-and-core-2.html`, scheme: 'WSQ' },
  'comptia-network-plus': { url: `${TC}/wsq-comptia-certified-network-training.html`, scheme: 'WSQ' },
  'comptia-security-plus': { url: `${TC}/wsq-comptia-certified-security-training.html`, scheme: 'WSQ' },
  'comptia-cloud-plus': { url: `${TC}/wsq-comptia-certified-cloud-training.html`, scheme: 'WSQ' },
  'comptia-linux-plus': { url: `${TC}/wsq-comptia-certified-linux-training.html`, scheme: 'WSQ' },
  'comptia-server-plus': { url: `${TC}/wsq-comptia-certified-server-training.html`, scheme: 'WSQ' },
  'comptia-data-plus': { url: `${TC}/wsq-comptia-certified-data-training.html`, scheme: 'WSQ' },
  'comptia-cysa-plus': { url: `${TC}/wsq-comptia-cybersecurity-analyst-cysa-training.html`, scheme: 'WSQ' },
  'comptia-securityx': { url: `${TC}/wsq-comptia-certified-securityx-training.html`, scheme: 'WSQ' },
  'comptia-pentest-plus': { url: `${TC}/casl-comptia-pentest-training.html`, scheme: 'CASL' },
  // Linux Foundation
  'linuxfoundation-cka': { url: `${TC}/wsq-certified-kubernetes-administrator-cka-training.html`, scheme: 'WSQ' },
  'linuxfoundation-ckad': { url: `${TC}/wsq-certified-kubernetes-application-developer-ckad-training.html`, scheme: 'WSQ' },
  'linuxfoundation-kcna': { url: `${TC}/wsq-kubernetes-and-cloud-native-associate-kcna-training.html`, scheme: 'WSQ' },
  // PMI
  'pmi-pmp': { url: `${TC}/wsq-project-management-professional.html`, scheme: 'WSQ' },
  // Microsoft
  'microsoft-az-900': { url: `${TC}/wsq-microsoft-azure-fundamentals-az-900.html`, scheme: 'WSQ' },
  'microsoft-az-104': { url: `${TC}/wsq-microsoft-certified-azure-administrator-associate-az-104.html`, scheme: 'WSQ' },
  'microsoft-dp-300': { url: `${TC}/wsq-administering-microsoft-azure-sql-solutions-dp-300.html`, scheme: 'WSQ' },
  'microsoft-dp-900': { url: `${TC}/wsq-microsoft-azure-data-fundamentals-dp-900.html`, scheme: 'WSQ' },
  'microsoft-md-102': { url: `${TC}/wsq-microsoft-certified-endpoint-administrator-associate-md-102.html`, scheme: 'WSQ' },
  'microsoft-pl-300': { url: `${TC}/wsq-microsoft-power-bi-data-analyst-associate-pl-300.html`, scheme: 'WSQ' },
  'microsoft-pl-900': { url: `${TC}/wsq-microsoft-power-platform-fundamentals-pl-900.html`, scheme: 'WSQ' },
  'microsoft-sc-300': { url: `${TC}/wsq-microsoft-identity-and-access-administrator-sc-300.html`, scheme: 'WSQ' },
  // AXELOS
  'axelos-itil4-foundation': { url: `${TC}/wsq-itil-4-foundation-training.html`, scheme: 'WSQ' },
  // Anthropic — non-WSQ (C991, C437), no course fee funding
  'anthropic-ccao-foundations': { url: `${TC}/claude-certified-associate-foundations-ccao-f-exam-prep.html` },
  'anthropic-cca-foundations': { url: `${TC}/claude-certified-architect-foundations-ccar-f-exam-prep.html` }
};

export function instructorLedCourseFor(productSlug: string): InstructorLedCourse | null {
  return INSTRUCTOR_LED_COURSES[productSlug] ?? null;
}
