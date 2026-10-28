// Default SEO meta for a product's practice exam. The pool fold fills any
// empty metaTitle / metaDescription / metaKeywords with these on every
// deploy; an admin edit (or AI Assist) on the Certification page (/admin-dashboard/certifications/[id]#seo)
// wins because only empty fields are filled.

const SITE = 'Tertiary Exams';
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

export function buildExamSeo({ title, code, vendor, domainCount, hasVoucher }: ExamSeoInput): ExamSeo {
  const t = title.trim();
  const paren = t.match(/\(([^()]+)\)\s*$/)?.[1]?.trim();
  const base = t.replace(/\s*\([^()]*\)\s*$/, '').trim();
  const extraCode = isRealCode(code) && !containsTokens(t, code) ? code : null;

  // Name with the exam code, e.g. "Cisco Certified Network Associate (CCNA 200-301)".
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

  const metaTitle = [
    `${name} Practice Exam | ${SITE}`,
    `${name} Practice Exam`,
    `${short} Practice Exam | ${SITE}`,
    `${short} Practice Exam`
  ].find((c) => c.length <= TITLE_MAX) ?? `${short} Practice Exam`.slice(0, TITLE_MAX).trim();

  const domains = domainCount > 0 ? `all ${domainCount} official exam domains` : 'every official exam domain';
  const describe = (n: string) =>
    `Prepare for the ${n} exam with realistic practice questions across ${domains}, a timed exam mode, detailed explanations and 10 free questions.`;
  const compact = (n: string) =>
    `${n} practice exam with realistic questions across ${domains}, timed exam mode, explanations and 10 free questions.`;
  let metaDescription = [describe(name), describe(short), describe(base), compact(short)].find((d) => d.length <= DESC_MAX)
    ?? compact(short).slice(0, DESC_MAX).replace(/\s+\S*$/, '');
  if (hasVoucher && metaDescription.length + ' Exam vouchers available.'.length <= DESC_MAX) {
    metaDescription += ' Exam vouchers available.';
  }

  // Commas would split one keyword into several.
  const plain = base.replace(/,/g, '');
  const key = codeKey ?? plain;
  const keywords = [
    `${plain} practice exam`,
    `${key} practice test`,
    `${key} exam questions`,
    `${key} mock exam`,
    `${vendor} certification`,
    hasVoucher ? `${key} exam voucher` : null
  ].filter((k): k is string => !!k);
  const metaKeywords = [...new Map(keywords.map((k) => [k.toLowerCase(), k])).values()].join(', ');

  return { metaTitle, metaDescription, metaKeywords };
}
