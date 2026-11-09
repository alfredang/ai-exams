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
// Google shows roughly 60–65 characters of a title and 155–160 of a description.
const TITLE_MAX = 66;
const DESC_MAX = 160;
const VENDOR_TITLE_MAX = 70;

// Homepage meta. Admins can override it in Settings → SITE_HOME_*; prisma/seed.ts
// moves a stored value on from LEGACY_HOME_SEO only while nobody has edited it.
export const HOME_SEO = {
  SITE_HOME_TITLE: `Practice Exams & Exam Vouchers in ${SEO_REGION} | ${SITE}`,
  SITE_HOME_DESCRIPTION: `Certification practice exams and official exam vouchers in ${SEO_REGION}: AWS, Microsoft AZ-900, Claude CCAR-F, CompTIA, Cisco, Kubernetes. 10 free questions.`,
  SITE_HOME_KEYWORDS: `practice exam ${SEO_REGION}, exam voucher ${SEO_REGION}, certification ${SEO_REGION}, IT certification practice exams, AZ-900 practice exam ${SEO_REGION}, AZ-900 exam voucher ${SEO_REGION}, CCAR-F practice exam, CCA-F practice exam, AWS practice exam ${SEO_REGION}, AWS exam voucher ${SEO_REGION}, CompTIA exam voucher ${SEO_REGION}, CompTIA Security+ practice exam, CKA practice exam, CCNA practice exam, PMP practice exam ${SEO_REGION}, CISSP practice exam ${SEO_REGION}`
};
export const LEGACY_HOME_SEO = {
  SITE_HOME_TITLE: 'Tertiary Exams — Practice Smarter for Your Next Certification',
  SITE_HOME_DESCRIPTION: 'Original, blueprint-aligned practice questions for AWS, Microsoft, Cisco, CompTIA, Google Cloud, Kubernetes, Anthropic and more. By Tertiary Infotech Academy.',
  SITE_HOME_KEYWORDS: 'IT certification practice exams, AWS practice exam, Azure practice exam, CompTIA practice exam, Cisco practice exam, Google Cloud practice exam, Kubernetes practice exam, CKAD, CKA, SAA-C03, AZ-900, exam voucher, Tertiary Infotech Academy, Tertiary Exams'
};

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
  /** What people search for: "CCAO-F", "AZ-900", "CompTIA Security+" — the base name when there is no code. */
  key: string;
  /** Key with the brand when it helps: "Microsoft AZ-900", "AWS SAA-C03", "CompTIA Security+ SY0-701". */
  short: string;
  /** True when `key` is a real exam code rather than the name. */
  hasCode: boolean;
  /** The exam code when there is one, even if `key` is the name: "SY0-701". */
  code: string | null;
  /** Other spelling people search for: CCAR-F is also written "CCA-F". */
  aka: string | null;
  /** Short searchable names for a title's tail, longest first: "Solutions Architect Associate", "Solutions Architect". */
  tags: string[];
};

// Codes too short to search alone: "CC practice exam" could be anything.
const AMBIGUOUS_CODES = new Set(['ACE', 'CC', 'DCA']);

const ALSO_KNOWN_AS: Record<string, string> = { 'CCAR-F': 'CCA-F' };

// The name without the vendor and filler, for the end of a title. Claude's
// names are searched whole ("Claude Certified Architect"), so they keep it.
function tagsFor(base: string, vendor: string, brand: string | null): string[] {
  let s = base;
  for (const prefix of [vendor, brand]) {
    if (prefix && s.toLowerCase().startsWith(`${prefix.toLowerCase()} `)) {
      s = s.slice(prefix.length + 1);
      break;
    }
  }
  if (!/^claude\b/i.test(base)) s = s.replace(/\bCertified:?\s+(?!in\b)/g, '').replace(/^Professional:\s*/, '');
  if (/^\d/.test(s)) s = `${vendor} ${s}`; // "Microsoft 365 Administrator", not "365 Administrator".
  const full = s.replace(/,/g, '').replace(/\s+[—–-]\s+/g, ' ').replace(/\s+/g, ' ').trim();
  const brief = full === s
    ? full.replace(/\s+(Associate|Expert)$/, '')
    : s.replace(/\s+[—–-]\s+.*$/, '').trim();
  return [...new Set([full, brief])].filter((t) => t.split(/\s+/).length >= 2);
}

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
  // Commas would split one keyword into several; dashes are noise in a query.
  const plain = base.replace(/,/g, '').replace(/\bCertified:\s+/, '').replace(/\s+[—–-]\s+/g, ' ').replace(/\s+/g, ' ').trim();
  // CompTIA exams are searched by name ("Security+"), far more than by "SY0-701".
  const nameFirst = !!codeKey && /^comptia\b/i.test(t);
  const short = nameFirst ? `${plain} ${codeKey}`
    : codeKey ? (brand && !codeKey.toLowerCase().startsWith(brand.toLowerCase()) ? `${brand} ${codeKey}` : codeKey)
    : plain;
  const key = nameFirst ? plain
    : codeKey ? (AMBIGUOUS_CODES.has(codeKey) ? short : codeKey)
    : plain;
  return {
    name, base, plain, key, short,
    hasCode: !!codeKey && !nameFirst,
    code: codeKey,
    aka: (codeKey && ALSO_KNOWN_AS[codeKey]) || null,
    tags: tagsFor(base, vendor, brand)
  };
}

/** A product title with its exam code, for an H1: "AWS Certified AI Practitioner (AIF-C01) Exam Voucher". */
export function headingWithCode(title: string, cert: { title: string; code: string; vendor: string }): string {
  const { code, base } = certNames(cert);
  if (!code || containsTokens(title, code)) return title;
  return title.startsWith(base) ? `${base} (${code})${title.slice(base.length)}` : `${title} (${code})`;
}

const fit = (candidates: (string | null)[], max: number) =>
  candidates.find((c): c is string => !!c && c.length <= max);

const keywordList = (list: (string | null | false)[]) =>
  [...new Map(list.filter((k): k is string => !!k).map((k) => [k.toLowerCase(), k])).values()].join(', ');

// Long names lose their filler before they lose the region, and a title is
// never cut mid-word: "Google Machine Learning Engineer Practice Exam in Singapore".
function compactNames(plain: string): string[] {
  const noCertified = plain.replace(/\bCertified:?\s+(?!in\b)/g, '');
  return [...new Set([plain, noCertified, noCertified.replace(/\bProfessional\s+/g, '')])];
}

function productTitle(names: CertNames, thing: string): string {
  const { key, short, plain, tags, hasCode } = names;
  const inSg = `${thing} in ${SEO_REGION}`;
  return fit([
    ...(hasCode
      ? [short, key].flatMap((lead) => tags.map((tag) => `${lead} ${inSg} | ${tag}`))
      : []),
    `${short} ${inSg} | ${SITE}`,
    `${short} ${inSg}`,
    `${key} ${inSg}`,
    ...compactNames(plain).map((n) => `${n} ${inSg}`),
    ...compactNames(plain).map((n) => `${n} ${thing}`)
  ], TITLE_MAX) ?? `${key} ${thing}`;
}

export function buildExamSeo({ title, code, vendor, domainCount, hasVoucher }: ExamSeoInput): ExamSeo {
  const names = certNames({ title, code, vendor });
  const { plain, key, hasCode, aka } = names;
  const metaTitle = productTitle(names, 'Practice Exam');

  const domains = domainCount > 0 ? `all ${domainCount} official domains` : 'every official domain';
  const codeNote = !hasCode && names.code ? ` (${names.code})` : '';
  const kw = `${key}${codeNote} practice exam in ${SEO_REGION}`;
  let metaDescription = fit([
    // Name both search terms ("CCAO-F" and "Claude Certified Associate Foundations") when they fit.
    hasCode ? `${kw} for ${plain}: timed mock exams across ${domains}, full explanations and 10 free questions.` : null,
    hasCode ? `${kw} for ${plain}: timed mock exams, full explanations and 10 free questions.` : null,
    `${kw}: timed mock exams across ${domains}, full explanations, unlimited retakes and 10 free questions.`,
    `${kw}: timed mock exams across ${domains}, full explanations and 10 free questions.`,
    `${kw}: timed mock exams, full explanations and 10 free questions.`
  ], DESC_MAX) ?? kw;
  const voucherNote = ' Exam voucher available.';
  if (hasVoucher && metaDescription.length + voucherNote.length <= DESC_MAX) metaDescription += voucherNote;

  const metaKeywords = keywordList([
    `${key} practice exam in ${SEO_REGION}`,
    hasCode && `${plain} practice exam in ${SEO_REGION}`,
    `${key} practice exam`,
    `${key} practice test`,
    `${key} practice test ${SEO_REGION}`,
    `${key} mock exam`,
    `${key} exam questions`,
    `${key} exam ${SEO_REGION}`,
    `${key} certification ${SEO_REGION}`,
    hasCode && `${key} certification practice exam`,
    hasCode && `${plain} practice test`,
    !hasCode && names.code && `${names.code} practice exam`,
    aka && `${aka} practice exam`,
    aka && `${aka} mock exam`,
    hasVoucher && `${key} exam voucher in ${SEO_REGION}`,
    `${vendor} certification ${SEO_REGION}`
  ]);

  return { metaTitle, metaDescription, metaKeywords };
}

/** SEO meta for the Exam Voucher page (built on render; vouchers have no stored meta). */
export function buildVoucherSeo({ title, code, vendor }: { title: string; code: string; vendor: string }): ExamSeo {
  const names = certNames({ title, code, vendor });
  const { name, plain, key, short, hasCode, aka } = names;
  const metaTitle = productTitle(names, 'Exam Voucher');

  const kw = `${key} exam voucher in ${SEO_REGION}`;
  let metaDescription = fit([
    `Buy the official ${name} exam voucher in ${SEO_REGION}, emailed within ${VOUCHER_DELIVERY_TEXT}, with our ${key} practice exam included free.`,
    `Buy your ${kw}: official ${short} voucher emailed within ${VOUCHER_DELIVERY_TEXT}, with our practice exam included free.`,
    `Buy your ${kw}, emailed within ${VOUCHER_DELIVERY_TEXT}, with the practice exam included free.`,
    `Official ${kw}, emailed within ${VOUCHER_DELIVERY_TEXT}, practice exam free.`
  ], DESC_MAX) ?? kw;
  const taxNote = ' GST inclusive.';
  if (metaDescription.length + taxNote.length <= DESC_MAX) metaDescription += taxNote;

  const metaKeywords = keywordList([
    `${key} exam voucher in ${SEO_REGION}`,
    hasCode && `${plain} exam voucher in ${SEO_REGION}`,
    `buy ${key} exam voucher`,
    `${key} exam voucher`,
    `${key} exam voucher price`,
    `${key} exam cost ${SEO_REGION}`,
    `${key} exam fee ${SEO_REGION}`,
    `${key} exam ${SEO_REGION}`,
    `${key} certification ${SEO_REGION}`,
    hasCode && `${key} certification exam voucher`,
    !hasCode && names.code && `${names.code} exam voucher`,
    aka && `${aka} exam voucher`,
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
  aws: { brand: 'AWS', terms: ['AWS'], lead: ['CLF-C02', 'SAA-C03', 'AIF-C01', 'DVA-C02', 'SAP-C02'] },
  anthropic: { brand: 'Claude', terms: ['Claude', 'Anthropic'], lead: ['CCAR-F', 'CCAO-F', 'CCDV-F', 'CCAR-P'] },
  axelos: { brand: 'ITIL 4', terms: ['ITIL 4', 'ITIL'] },
  cisco: { brand: 'Cisco', terms: ['Cisco'], lead: ['CCNA', 'ENCOR 350-401', 'SCOR 350-701'] },
  comptia: { brand: 'CompTIA', terms: ['CompTIA'], lead: ['CompTIA Security+', 'CompTIA A+', 'CompTIA Network+', 'CompTIA CySA+', 'CompTIA PenTest+'] },
  google: { brand: 'Google Cloud', terms: ['Google Cloud', 'Google'], lead: ['Google ACE', 'Google Professional Cloud Architect'] },
  hashicorp: { brand: 'Terraform & HashiCorp', terms: ['Terraform', 'HashiCorp'] },
  isc2: { brand: 'CISSP & ISC2', terms: ['CISSP', 'ISC2'], lead: ['ISC2 CISSP', 'ISC2 CC', 'ISC2 CCSP', 'ISC2 SSCP'] },
  linuxfoundation: { brand: 'CKA, CKAD & Kubernetes', terms: ['CKA', 'CKAD', 'Kubernetes'], lead: ['CKA', 'CKAD', 'CKS', 'KCNA'] },
  microsoft: { brand: 'Microsoft', terms: ['Microsoft', 'Azure'], lead: ['AZ-900', 'AZ-104', 'AI-900', 'AZ-305', 'SC-900'] },
  pmi: { brand: 'PMP & PMI', terms: ['PMP', 'PMI'], lead: ['PMI PMP', 'PMI CAPM', 'PMI-ACP', 'PMI-RMP'] },
  redhat: { brand: 'RHCSA & Red Hat', terms: ['RHCSA', 'Red Hat'] },
  'scrum-org': { brand: 'PSM & PSPO Scrum', terms: ['PSM', 'PSPO', 'Scrum'] }
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
  ], VENDOR_TITLE_MAX) ?? heading;

  const lead = kind === 'practice'
    ? `Practice exams for ${brand} certifications in ${SEO_REGION}`
    : `Buy official exam vouchers for ${brand} certifications in ${SEO_REGION}`;
  // Each tail: [after a list of exams, straight after the lead]. The exam codes
  // are the keywords, so the list-friendly tail is short.
  const tails: [string, string][] = kind === 'practice'
    ? [
        ['. Timed exams, explanations and 10 free questions.', '. Timed exam mode, explanations by exam domain, unlimited retakes and 10 free questions.'],
        ['. 10 free questions.', ': timed exams, explanations and 10 free questions.']
      ]
    : [
        ['. Practice exam included free. GST inclusive.', `, emailed within ${VOUCHER_DELIVERY_TEXT} with the practice exam included free. GST inclusive.`],
        ['. Practice exam included free.', ', with the practice exam included free. GST inclusive.']
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
