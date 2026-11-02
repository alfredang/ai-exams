// Default SEO meta for a certification's two products, targeted at searchers
// in Singapore ("AZ-900 practice exam in Singapore", "CCAO-F exam voucher in
// Singapore").
//
// Practice Exam: stored on the pool exam. The pool fold regenerates it on
// every deploy unless an admin saved it or ran AI Assist in the SEO meta
// section of the Practice Exam page (/admin-dashboard/bundles/[id]#seo) —
// then only empty fields are filled.
// Exam Voucher: has no stored meta; the voucher page builds it on render.
//
// Imported by prisma/seed.ts (via pool-consolidation) — keep imports relative.
import { VOUCHER_DELIVERY_TEXT } from './products';

const SITE = 'Tertiary Exams';
export const SEO_REGION = 'Singapore';
const TITLE_MAX = 70;
const DESC_MAX = 180;

export type ExamSeoInput = {
  title: string;        // product title, e.g. "Microsoft Azure Administrator (AZ-104)"
  code: string;         // Exam.code, e.g. "AZ-104" or "PROFESSIONAL-DATA-ENGINEER"
  vendor: string;       // Vendor.name
  domainCount: number;
  hasVoucher: boolean;
};

export type ExamSeo = { metaTitle: string; metaDescription: string; metaKeywords: string };

const tokens = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

function containsTokens(haystack: string, needle: string) {
  const h = tokens(haystack).join(' ');
  const n = tokens(needle).join(' ');
  return !!n && ` ${h} `.includes(` ${n} `);
}

// Exam.code is sometimes a real vendor code (AZ-104, SK0-005, CISSP) and
// sometimes a slug-derived placeholder (PROFESSIONAL-DATA-ENGINEER, A-PLUS).
function isRealCode(code: string) {
  if (/\d/.test(code)) return code.length <= 8 && /^[A-Z0-9]+(?:-[A-Z0-9]+)?$/.test(code);
  return /^[A-Z]{2,5}$/.test(code);
}

export type CertNames = {
  /** With the exam code: "Cisco Certified Network Associate (CCNA 200-301)". */
  name: string;
  /** Without it: "Claude Certified Associate — Foundations". */
  base: string;
  /** Keyword-safe base, no dashes or commas: "Claude Certified Associate Foundations". */
  plain: string;
  /** What people search for: "CCAO-F", "AZ-900", "CCNA" — the base name when there is no code. */
  key: string;
  /** Key with the brand when it helps: "Microsoft AZ-900", "AWS SAA-C03". */
  short: string;
  /** True when `key` is a real exam code rather than the name. */
  hasCode: boolean;
};

export function certNames({ title, code, vendor }: { title: string; code: string; vendor: string }): CertNames {
  const t = title.trim();
  const paren = t.match(/\(([^()]+)\)\s*$/)?.[1]?.trim();
  const base = t.replace(/\s*\([^()]*\)\s*$/, '').trim();
  const extraCode = isRealCode(code) && !containsTokens(t, code) ? code : null;

  const name = extraCode ? (paren ? t.replace(/\)\s*$/, ` ${extraCode})`) : `${t} (${extraCode})`) : t;
  // A trailing "(002)" is a version, not an exam code.
  const codeKey = paren && !paren.includes('/') && /[A-Za-z]/.test(paren) ? paren : extraCode;
  // "Microsoft AZ-104", "AWS SAA-C03", "Red Hat RHCSA EX200" — but not "Professional PSM I".
  const first = t.split(/\s+/)[0];
  const brand = t.toLowerCase().startsWith(`${vendor.toLowerCase()} `) ? vendor
    : vendor.split(/\s+/)[0].toLowerCase() === first.toLowerCase() || /^[A-Z0-9]{2,}$/.test(first) ? first
    : null;
  const short = codeKey
    ? (brand && !codeKey.toLowerCase().startsWith(brand.toLowerCase()) ? `${brand} ${codeKey}` : codeKey)
    : base;
  // Commas would split one keyword into several; dashes are noise in a query.
  const plain = base.replace(/,/g, '').replace(/\s+[—–-]\s+/g, ' ').replace(/\s+/g, ' ').trim();
  return { name, base, plain, key: codeKey ?? plain, short, hasCode: !!codeKey };
}

const fit = (candidates: (string | null)[], max: number) =>
  candidates.find((c): c is string => !!c && c.length <= max);

const keywordList = (list: (string | null | false)[]) =>
  [...new Map(list.filter((k): k is string => !!k).map((k) => [k.toLowerCase(), k])).values()].join(', ');

export function buildExamSeo({ title, code, vendor, domainCount, hasVoucher }: ExamSeoInput): ExamSeo {
  const { base, plain, key, short, hasCode } = certNames({ title, code, vendor });
  const inSg = `Practice Exam in ${SEO_REGION}`;

  const metaTitle = fit([
    hasCode ? `${key} ${inSg} | ${base}` : null,
    // When the full name doesn't fit: "CKAD Certification Practice Exam in Singapore".
    hasCode ? `${short} Certification ${inSg}` : null,
    `${short} ${inSg} | ${SITE}`,
    `${key} ${inSg} | ${SITE}`,
    `${short} ${inSg}`,
    `${key} ${inSg}`
  ], TITLE_MAX) ?? `${key} ${inSg}`.slice(0, TITLE_MAX).trim();

  const domains = domainCount > 0 ? `all ${domainCount} official exam domains` : 'every official exam domain';
  const kw = `${key} practice exam in ${SEO_REGION}`;
  let metaDescription = fit([
    // Name both search terms ("CCAO-F" and "Claude Certified Associate — Foundations") when they fit.
    hasCode ? `${kw} for the ${base} certification: realistic questions across ${domains}, timed exam mode, explanations and 10 free questions.` : null,
    hasCode ? `${kw} for the ${base} certification: questions across ${domains}, timed exam mode, explanations and 10 free questions.` : null,
    hasCode ? `${kw} for ${base}: questions across ${domains}, timed exam mode and 10 free questions.` : null,
    `${kw}: realistic questions across ${domains}, timed exam mode, detailed explanations and 10 free questions.`,
    `${kw}: realistic questions across ${domains}, timed exam mode, explanations and 10 free questions.`,
    `${kw} with timed exam mode, explanations and 10 free questions.`
  ], DESC_MAX) ?? kw;
  const voucherNote = ` ${key} exam voucher available.`;
  if (hasVoucher && metaDescription.length + voucherNote.length <= DESC_MAX) metaDescription += voucherNote;

  const metaKeywords = keywordList([
    `${key} practice exam in ${SEO_REGION}`,
    hasCode && `${plain} practice exam in ${SEO_REGION}`,
    `${key} practice exam`,
    hasCode && `${key} certification practice exam`,
    `${key} practice test ${SEO_REGION}`,
    `${key} mock exam`,
    `${key} exam questions`,
    hasVoucher && `${key} exam voucher in ${SEO_REGION}`,
    `${vendor} certification ${SEO_REGION}`
  ]);

  return { metaTitle, metaDescription, metaKeywords };
}

/** SEO meta for the Exam Voucher page (built on render; vouchers have no stored meta). */
export function buildVoucherSeo({ title, code, vendor }: { title: string; code: string; vendor: string }): ExamSeo {
  const { name, base, plain, key, short, hasCode } = certNames({ title, code, vendor });
  const inSg = `Exam Voucher in ${SEO_REGION}`;

  const metaTitle = fit([
    hasCode ? `${key} ${inSg} | ${base}` : null,
    hasCode ? `${short} Certification ${inSg}` : null,
    `${short} ${inSg} | ${SITE}`,
    `${key} ${inSg} | ${SITE}`,
    `${key} ${inSg}`
  ], TITLE_MAX) ?? `${key} ${inSg}`.slice(0, TITLE_MAX).trim();

  const kw = `${key} exam voucher in ${SEO_REGION}`;
  let metaDescription = fit([
    `Buy the official ${name} exam voucher in ${SEO_REGION}, emailed within ${VOUCHER_DELIVERY_TEXT}, with our ${key} practice exam included free.`,
    `Buy your ${kw} — official ${short} voucher emailed within ${VOUCHER_DELIVERY_TEXT}, with our ${key} practice exam included free.`,
    `Buy your ${kw}, emailed within ${VOUCHER_DELIVERY_TEXT}, with the ${key} practice exam included free.`
  ], DESC_MAX) ?? kw;
  const taxNote = ' GST inclusive, with tax invoice.';
  if (metaDescription.length + taxNote.length <= DESC_MAX) metaDescription += taxNote;

  const metaKeywords = keywordList([
    `${key} exam voucher in ${SEO_REGION}`,
    hasCode && `${plain} exam voucher in ${SEO_REGION}`,
    `buy ${key} exam voucher`,
    hasCode && `${key} certification exam voucher`,
    `${key} exam voucher price`,
    `${key} exam cost ${SEO_REGION}`,
    `${key} practice exam in ${SEO_REGION}`,
    `${vendor} exam voucher ${SEO_REGION}`
  ]);

  return { metaTitle, metaDescription, metaKeywords };
}

// Vendor landing pages — /practice-exams/[vendor] and /exam-vouchers/[vendor] —
// target "Practice Exams for AWS Certifications" / "Exam Vouchers for Claude
// Certifications". People search by the name they know, which is not always
// the Vendor's name: AWS (not Amazon Web Services), Claude (not Anthropic),
// CKA / CKAD (not Linux Foundation). Unlisted vendors use Vendor.name.
// `lead` lists the most-searched exam keys, which go first in the meta
// description and page copy; the rest follow alphabetically.
const VENDOR_SEO: Record<string, { brand: string; terms: string[]; lead?: string[] }> = {
  aws: { brand: 'AWS', terms: ['AWS'], lead: ['CLF-C02', 'SAA-C03', 'AIF-C01', 'DVA-C02'] },
  anthropic: { brand: 'Claude', terms: ['Claude', 'Anthropic'] },
  linuxfoundation: { brand: 'CKA, CKAD & Kubernetes', terms: ['CKA', 'CKAD', 'Kubernetes'], lead: ['CKA', 'CKAD', 'CKS', 'KCNA'] },
  microsoft: { brand: 'Microsoft', terms: ['Microsoft'], lead: ['AZ-900', 'AZ-104', 'AI-900', 'AI-102', 'AZ-305'] }
};

/** Sort a vendor's certifications for SEO copy: `lead` keys first, then A–Z. */
export function sortForVendorSeo<T>(slug: string, items: T[], keyOf: (item: T) => string): T[] {
  const lead = VENDOR_SEO[slug]?.lead ?? [];
  const rank = (k: string) => { const i = lead.indexOf(k); return i < 0 ? lead.length : i; };
  return [...items].sort((a, b) => rank(keyOf(a)) - rank(keyOf(b)) || keyOf(a).localeCompare(keyOf(b)));
}

export type VendorSeoKind = 'practice' | 'voucher';
export type VendorSeo = ExamSeo & { brand: string; heading: string };

export function vendorSeoBrand(slug: string, name: string) {
  const v = VENDOR_SEO[slug];
  return v ? { brand: v.brand, terms: v.terms } : { brand: name, terms: [name] };
}

/** "A, B and C" — with "and more" once the list is cut short. */
export function listOf(items: string[], max: number) {
  if (items.length > max) return `${items.slice(0, max).join(', ')} and more`;
  return items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : (items[0] ?? '');
}

/** `keys` are the certifications' search keys (certNames().key), most important first. */
export function buildVendorSeo({ kind, slug, name, keys }: {
  kind: VendorSeoKind;
  slug: string;
  name: string;
  keys: string[];
}): VendorSeo {
  const { brand, terms } = vendorSeoBrand(slug, name);
  const product = kind === 'practice' ? 'Practice Exams' : 'Exam Vouchers';
  const heading = `${product} for ${brand} Certifications`;

  const metaTitle = fit([
    `${heading} in ${SEO_REGION}`,
    `${heading} | ${SITE}`,
    heading
  ], TITLE_MAX) ?? heading.slice(0, TITLE_MAX).trim();

  const lead = kind === 'practice'
    ? `Practice exams for ${brand} certifications in ${SEO_REGION}`
    : `Buy official exam vouchers for ${brand} certifications in ${SEO_REGION}`;
  // Each tail: [after a list of exams, straight after the lead].
  const tails: [string, string][] = kind === 'practice'
    ? [
        ['. Timed exam mode, explanations by exam domain, unlimited retakes and 10 free questions.', '. Timed exam mode, explanations by exam domain, unlimited retakes and 10 free questions.'],
        ['. Timed exam mode, explanations and 10 free questions.', '. Timed exam mode, explanations and 10 free questions.']
      ]
    : [
        [`. Emailed within ${VOUCHER_DELIVERY_TEXT}, practice exam included free. GST inclusive.`, `, emailed within ${VOUCHER_DELIVERY_TEXT} with the practice exam included free. GST inclusive.`],
        ['. Practice exam included free.', ', with the practice exam included free.']
      ];
  // "…, including CKS, KCNA and KCSA" — skip keys the brand already names.
  const listed = keys.filter((k) => !containsTokens(brand, k));
  const lists = [6, 5, 4, 3, 2, 1].filter((n) => n <= listed.length).map((n) => `, including ${listOf(listed.slice(0, n), n)}`);
  const metaDescription = fit(
    tails.flatMap(([afterList, bare]) => [...lists.map((l) => `${lead}${l}${afterList}`), `${lead}${bare}`]),
    DESC_MAX
  ) ?? lead;

  const thing = kind === 'practice' ? 'practice exam' : 'exam voucher';
  const metaKeywords = keywordList([
    ...terms.map((t) => `${product.toLowerCase()} for ${t} certifications`),
    ...terms.map((t) => `${t} certification ${thing} ${SEO_REGION}`),
    `${terms[0]} ${thing}`,
    kind === 'practice' ? `${terms[0]} practice test` : `${terms[0]} exam voucher price`,
    name !== terms[0] && `${name} ${thing}`,
    ...keys.slice(0, 6).map((k) => `${k} ${thing}`)
  ]);

  return { brand, heading, metaTitle, metaDescription, metaKeywords };
}
