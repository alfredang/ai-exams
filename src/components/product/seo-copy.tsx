import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { certNames, SEO_REGION, type VendorSeoKind } from '@/lib/exam-seo';
import { VOUCHER_DELIVERY_TEXT } from '@/lib/products';

// Location copy for the two product pages. The search phrases people type
// ("AZ-900 practice exam in Singapore", "CCAO-F exam voucher in Singapore")
// are bolded and each used once or twice in about 120 words: 1–2% density,
// enough to rank without reading as keyword stuffing. The meta tags carry the
// same phrases (buildExamSeo / buildVoucherSeo in src/lib/exam-seo.ts).

type Cert = { title: string; code: string; vendor: string };

// Inside a link the keyword keeps the link colour.
function K({ children, link = false }: { children: React.ReactNode; link?: boolean }) {
  return <strong className={link ? 'font-semibold' : 'font-semibold text-ink dark:text-white'}>{children}</strong>;
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        <MapPin className="h-5 w-5 shrink-0 text-brand dark:text-brand-300" aria-hidden="true" />
        {heading}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{children}</div>
    </section>
  );
}

export function PracticeSeoCopy({ cert, poolSize, perAttempt, voucherHref }: {
  cert: Cert;
  poolSize: number;
  perAttempt: number;
  voucherHref?: string | null;
}) {
  const { base, plain, key, hasCode } = certNames(cert);
  return (
    <Section heading={`${key} practice exam in ${SEO_REGION}`}>
      <p>
        Preparing for the {hasCode ? <>{key} certification ({base})</> : <>{base} certification</>}? Our <K>{key} practice exam in {SEO_REGION}</K> gives you
        a {poolSize}-question pool, and every attempt draws {perAttempt} fresh questions weighted by the
        official exam domains — so you practise the topics that carry the most marks.
      </p>
      <p>
        {hasCode ? <>The <K>{plain} practice exam</K></> : 'It'} runs online, so you can study from home,
        the office or anywhere in {SEO_REGION}. Rehearse test day in the timed Exam mode, switch to Practice
        mode for instant explanations, and track your score by domain until you are ready to book.
        Prices show in US$ or S$, GST inclusive, with a tax invoice for every order.
      </p>
      {voucherHref && (
        <p>
          Booking the real exam? Our{' '}
          <Link href={voucherHref} className="text-brand hover:underline dark:text-brand-300">
            <K link>{key} exam voucher in {SEO_REGION}</K>
          </Link>{' '}
          includes this practice exam free.
        </p>
      )}
    </Section>
  );
}

export function VoucherSeoCopy({ cert, poolSize, practiceHref }: {
  cert: Cert;
  poolSize: number;
  practiceHref?: string | null;
}) {
  const { plain, key, hasCode } = certNames(cert);
  const practice = <K link={!!practiceHref}>{key} practice exam</K>;
  return (
    <Section heading={`${key} exam voucher in ${SEO_REGION}`}>
      <p>
        Buy your <K>{key} exam voucher in {SEO_REGION}</K> online and pay in US$ or S$, GST inclusive, with
        a tax invoice for every order. {hasCode ? <>The official <K>{plain} exam voucher</K></> : 'The official voucher'} covers
        one attempt at the real {hasCode ? `${key} certification` : cert.vendor} exam and is emailed within {VOUCHER_DELIVERY_TEXT}.
      </p>
      <p>
        Every voucher includes our{' '}
        {practiceHref
          ? <Link href={practiceHref} className="text-brand hover:underline dark:text-brand-300">{practice}</Link>
          : practice}{' '}
        free: a {poolSize}-question pool, timed Exam mode and unlimited retakes, so candidates in {SEO_REGION} can
        find their weak domains before they book a date.
      </p>
    </Section>
  );
}

// Vendor landing pages (/practice-exams/[vendor], /exam-vouchers/[vendor]):
// the page's own phrase ("practice exams for AWS certifications") once in
// bold, then a keyword-anchored link to each certification and to the
// sibling page. Meta tags come from buildVendorSeo().
export function VendorSeoCopy({ kind, brand, vendor, certs, siblingHref }: {
  kind: VendorSeoKind;
  /** Search brand from buildVendorSeo: "AWS", "Claude", "CKA, CKAD & Kubernetes". */
  brand: string;
  vendor: string;
  certs: { key: string; href: string }[];
  /** The other product's vendor page, when this vendor sells both. */
  siblingHref?: string | null;
}) {
  const MAX = 8;
  const shown = certs.slice(0, MAX);
  const thing = kind === 'practice' ? 'practice exam' : 'exam voucher';
  const links = shown.map((c, i) => (
    <span key={c.href}>
      {i > 0 && (i === shown.length - 1 && certs.length <= MAX ? ' and ' : ', ')}
      <Link href={c.href} className="text-brand hover:underline dark:text-brand-300">{c.key} {thing}</Link>
    </span>
  ));
  const more = certs.length > MAX ? ` and ${certs.length - MAX} more` : '';
  const sibling = (label: string) => siblingHref
    ? <Link href={siblingHref} className="text-brand hover:underline dark:text-brand-300"><K link>{label}</K></Link>
    : null;

  if (kind === 'practice') {
    return (
      <Section heading={`Practice exams for ${brand} certifications in ${SEO_REGION}`}>
        <p>
          Our <K>practice exams for {brand} certifications</K> cover {certs.length} {vendor} exam{certs.length === 1 ? '' : 's'}
          {certs.length > 0 && <> — the {links}{more}</>}. Every attempt draws fresh questions weighted by the
          official exam domains, with a timed Exam mode, Practice mode explanations and unlimited retakes, so
          candidates in {SEO_REGION} can find their weak domains before they book.
        </p>
        <p>
          Start with 10 free questions on any {brand} practice exam — no payment needed.
          {siblingHref && <> Ready to book the real exam? Our {sibling(`exam vouchers for ${brand} certifications`)} include the matching practice exam free.</>}
        </p>
      </Section>
    );
  }
  return (
    <Section heading={`Exam vouchers for ${brand} certifications in ${SEO_REGION}`}>
      <p>
        Buy official <K>exam vouchers for {brand} certifications</K> online in {SEO_REGION}
        {certs.length > 0 && <> — the {links}{more}</>}. Each genuine {vendor} voucher covers one attempt at the
        real exam and is emailed within {VOUCHER_DELIVERY_TEXT}. Pay in US$ or S$, GST inclusive, with a tax
        invoice for every order.
      </p>
      <p>
        Every voucher includes the matching practice exam free, so you can rehearse in timed Exam mode while you
        wait for your code.
        {siblingHref && <> Only need practice? See our {sibling(`practice exams for ${brand} certifications`)}.</>}
      </p>
    </Section>
  );
}
