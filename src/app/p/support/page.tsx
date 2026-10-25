import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Building2,
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  MessageSquareWarning,
  Phone,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users
} from 'lucide-react';
import { db } from '@/lib/db';
import { getCompanyInfo, getTeaserSize } from '@/lib/settings';
import { VOUCHER_DELIVERY_TEXT } from '@/lib/products';
import { serializeJsonLd } from '@/lib/structured-data';
import { WHATSAPP_DISPLAY, whatsappLink } from '@/lib/enquiry-topics';
import { DotPattern } from '@/components/dot-pattern';
import { EnquiryForm } from '@/components/support/enquiry-form';
import { TopicLink } from '@/components/support/topic-link';
import { WhatsAppGlyph } from '@/components/support/whatsapp-glyph';

// Overrides the CMS /p/[slug] route for "support": the page is a lead form,
// not editable prose. Catalog names for the form refresh every 10 minutes.
export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Contact & Support — Free Certification Study Plan',
  description:
    'Talk to a certification advisor. Get a free study plan, an Exam Voucher quote or team pricing — reply within one business day, or chat with us on WhatsApp.',
  alternates: { canonical: '/p/support' }
};

const WA_HELLO = 'Hi! I would like some advice on which certification exam to take.';

function displayPhone(value: string): string {
  const m = value.replace(/\s+/g, '').match(/^\+65(\d{4})(\d{4})$/);
  return m ? `+65 ${m[1]} ${m[2]}` : value;
}

async function loadData() {
  try {
    const [company, teaserN, products] = await Promise.all([
      getCompanyInfo(),
      getTeaserSize(),
      db.bundle.findMany({ where: { published: true }, select: { title: true }, orderBy: { title: 'asc' } })
    ]);
    return { company, teaserN, certifications: products.map((p) => p.title) };
  } catch {
    return {
      company: {
        name: 'Tertiary Infotech Academy Pte Ltd',
        shortName: 'Tertiary Exams',
        uen: '201200696W',
        address: '12 Woodland Square #07-85/86/87 Woods Square Tower 1, Singapore 737715',
        email: 'sales@tertiarycourses.com.sg',
        tel: '+6561000613',
        website: ''
      },
      teaserN: 10,
      certifications: [] as string[]
    };
  }
}

const QUICK_HELP = [
  {
    icon: BookOpenCheck,
    title: 'Practice Exam access',
    body: 'Access unlocks the moment payment clears. Find every exam you own under My Exams, with Exam mode and Practice mode.',
    href: '/user-dashboard/exams',
    cta: 'Open My Exams'
  },
  {
    icon: Ticket,
    title: 'Exam Voucher delivery',
    body: `Official voucher codes are emailed within ${VOUCHER_DELIVERY_TEXT}. The Practice Exam is included and unlocks straight away.`,
    href: '/user-dashboard/vouchers',
    cta: 'Open My Vouchers'
  },
  {
    icon: Receipt,
    title: 'Invoices & receipts',
    body: 'Download a tax invoice for any paid order from your dashboard — ready for claims and reimbursement.',
    href: '/user-dashboard/invoices',
    cta: 'Open Invoices'
  },
  {
    icon: RotateCcw,
    title: 'Refunds',
    body: 'See eligibility and processing times. The voucher portion becomes non-refundable once its code has been issued.',
    href: '/p/refund-policy',
    cta: 'Read the Refund Policy'
  }
] as const;

export default async function SupportPage() {
  const { company, teaserN, certifications } = await loadData();
  const tel = company.tel ? displayPhone(company.tel) : '';
  const email = company.email || 'sales@tertiarycourses.com.sg';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact & Support',
    mainEntity: {
      '@type': 'Organization',
      name: company.name,
      email,
      ...(tel ? { telephone: tel } : {}),
      contactPoint: [
        { '@type': 'ContactPoint', contactType: 'customer support', email, ...(tel ? { telephone: tel } : {}), areaServed: 'Worldwide', availableLanguage: ['English'] },
        { '@type': 'ContactPoint', contactType: 'sales', telephone: WHATSAPP_DISPLAY.replace(/\s+/g, ''), areaServed: 'Worldwide' }
      ]
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />

      {/* Hero + lead form */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-br from-brand-100 via-sky-50 to-page dark:border-slate-800 dark:from-[#0a1838] dark:via-slate-950 dark:to-slate-950">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-300/30 blur-3xl motion-safe:animate-drift dark:bg-brand-500/20" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[380px] w-[380px] rounded-full bg-emerald-200/40 blur-3xl motion-safe:animate-drift motion-safe:[animation-delay:-7s] dark:bg-emerald-500/10" />
        <div className="pointer-events-none absolute inset-0 text-brand-300/50 [mask-image:radial-gradient(ellipse_at_top_left,black_15%,transparent_65%)] dark:text-brand-400/20">
          <DotPattern className="h-full w-full" />
        </div>

        {/* Phones: headline → form → details. Desktop: intro + details left, form right. */}
        <div className="container-app relative grid grid-cols-[minmax(0,1fr)] gap-8 py-8 md:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-0">
          <div className="min-w-0 max-lg:order-1 lg:col-start-1 lg:row-start-1 lg:pt-4">
            <nav className="text-sm" aria-label="Breadcrumb">
              <Link href="/" className="text-slate-500 hover:underline dark:text-slate-400">← Home</Link>
            </nav>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3 py-1 text-xs font-semibold text-brand-700 shadow-card dark:border-slate-700 dark:bg-slate-900/70 dark:text-brand-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Free advice · Reply within one business day
            </p>
            <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
              Talk to a<br />
              <span className="gradient-text">certification advisor.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
              Not sure which exam to take, or how to prepare in the time you have? Tell us your goal and we&rsquo;ll send you a
              <b className="text-ink dark:text-white"> free study plan</b> — or a quote for your Exam Voucher or team.
            </p>
          </div>

          <div className="min-w-0 max-lg:order-3 lg:col-start-1 lg:row-start-2">
            <ul className="space-y-3 lg:mt-6">
              {[
                { icon: ClipboardList, t: 'Free personalised study plan', d: 'The right certification for your role, and a week-by-week prep path.' },
                { icon: Ticket, t: 'Exam Voucher quote', d: 'Official vouchers that include the Practice Exam free.' },
                { icon: Users, t: 'Teams & corporate', d: 'Several staff, one order and one invoice for your company.' }
              ].map(({ icon: Icon, t, d }) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-card ring-1 ring-brand-100 dark:bg-slate-900 dark:text-brand-300 dark:ring-slate-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-semibold text-ink dark:text-white">{t}</span>
                    <span className="block text-sm text-slate-600 dark:text-slate-400">{d}</span>
                  </span>
                </li>
              ))}
            </ul>

            {/* Contact channels */}
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <a
                href={whatsappLink(WA_HELLO)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-xl bg-[#25D366] p-4 text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-[#1ebe5a]"
              >
                <WhatsAppGlyph className="h-6 w-6" />
                <span className="mt-2 text-sm font-bold">WhatsApp</span>
                <span className="text-xs text-white/90">{WHATSAPP_DISPLAY}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold">
                  Fastest reply <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </a>
              <a href={`mailto:${email}`} className="card-hover flex flex-col p-4">
                <Mail className="h-6 w-6 text-brand dark:text-brand-300" aria-hidden="true" />
                <span className="mt-2 text-sm font-bold text-ink dark:text-white">Email</span>
                <span className="break-all text-xs text-slate-600 dark:text-slate-400">{email}</span>
                <span className="mt-2 text-xs font-semibold text-brand dark:text-brand-300">Within 1 business day</span>
              </a>
              {tel && (
                <a href={`tel:${company.tel.replace(/\s+/g, '')}`} className="card-hover flex flex-col p-4">
                  <Phone className="h-6 w-6 text-brand dark:text-brand-300" aria-hidden="true" />
                  <span className="mt-2 text-sm font-bold text-ink dark:text-white">Call us</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{tel}</span>
                  <span className="mt-2 text-xs font-semibold text-brand dark:text-brand-300">Singapore office</span>
                </a>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted dark:text-slate-400">
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Money-back guarantee</span>
              <span className="inline-flex items-center gap-1"><BadgeCheck className="h-4 w-4" aria-hidden="true" /> {certifications.length || 'Dozens of'}+ certifications</span>
              <span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" aria-hidden="true" /> Singapore-registered training provider</span>
            </div>
          </div>

          {/* Lead form */}
          <div id="enquiry" className="min-w-0 scroll-mt-24 max-lg:order-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-lift dark:border-slate-700 dark:bg-slate-900 dark:shadow-glow">
              <div className="relative overflow-hidden bg-gradient-to-r from-brand to-indigo-600 px-5 py-5 text-white sm:px-7 dark:from-brand-600 dark:to-indigo-600">
                <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/80">Free · No obligation</p>
                <h2 className="mt-1 text-xl font-bold sm:text-2xl">Get your free study plan &amp; quote</h2>
                <p className="mt-1 text-sm text-white/85">
                  An advisor reads every enquiry and replies personally within one business day.
                </p>
              </div>
              <EnquiryForm certifications={certifications} teaserN={teaserN} />
            </div>
          </div>
        </div>
      </section>

      {/* Start free — the no-commitment offer */}
      <section className="container-app py-8 md:py-10">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-sky-50 p-6 sm:p-8 dark:border-emerald-500/20 dark:from-emerald-500/10 dark:via-slate-900 dark:to-slate-900">
          <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm dark:bg-emerald-500">
                <GraduationCap className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-ink dark:text-white">Not ready to talk? Try {teaserN} questions free.</h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  Every Practice Exam has a free {teaserN}-question teaser with full explanations and a score report. No card needed — see where you stand in 15 minutes.
                </p>
              </div>
            </div>
            <Link href="/practice-exams" className="btn min-h-[48px] shrink-0 bg-emerald-600 px-6 text-base text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400">
              Start a free teaser <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Self-help */}
      <section className="border-y border-line bg-canvas py-10 md:py-12 dark:border-slate-800">
        <div className="container-app">
          <p className="eyebrow">Quick answers</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Already a customer? Most answers are one click away.</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_HELP.map(({ icon: Icon, title, body, href, cta }) => (
              <Link key={title} href={href} className="card-hover group flex flex-col p-5">
                <Icon className="h-6 w-6 text-brand dark:text-brand-300" aria-hidden="true" />
                <h3 className="mt-3 font-semibold text-ink dark:text-white">{title}</h3>
                <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-400">{body}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand dark:text-brand-300">
                  {cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
            <TopicLink topic="CONTENT" className="card-hover group flex flex-col p-5">
              <MessageSquareWarning className="h-6 w-6 text-brand dark:text-brand-300" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-ink dark:text-white">Question feedback</h3>
              <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-400">
                Spotted an error in a question or explanation? Tell us the exam and question — our authors review every report.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand dark:text-brand-300">
                Report a question <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </TopicLink>
            <TopicLink topic="TEAM" className="card-hover group flex flex-col p-5">
              <Users className="h-6 w-6 text-brand dark:text-brand-300" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-ink dark:text-white">Teams &amp; corporate</h3>
              <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-400">
                Preparing a team for certification? Get one quote and one invoice for Practice Exams and Exam Vouchers.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand dark:text-brand-300">
                Request a team quote <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </TopicLink>
          </div>
        </div>
      </section>

      {/* Before you write + company */}
      <section className="container-app grid gap-6 py-10 md:py-12 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand dark:text-brand-300" aria-hidden="true" />
            <h2 className="text-lg font-bold">Get a faster answer</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Include these details and we can usually solve it in one reply:</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {['The email on your account', 'Your order number, if you have one', 'The exam code (e.g. SAA-C03)', 'A short description — a screenshot helps'].map((x) => (
              <li key={x} className="flex gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> {x}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            Never send passwords, payment-card details or voucher codes — we will never ask for them.
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brand dark:text-brand-300" aria-hidden="true" />
            <h2 className="text-lg font-bold">{company.name}</h2>
          </div>
          {company.uen && <p className="mt-1 text-xs text-muted dark:text-slate-400">UEN {company.uen}</p>}
          <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
            {company.address && (
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {company.address}
                </a>
              </li>
            )}
            {tel && (
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <a href={`tel:${company.tel.replace(/\s+/g, '')}`} className="hover:underline">{tel}</a>
              </li>
            )}
            <li className="flex gap-2">
              <WhatsAppGlyph className="mt-0.5 h-4 w-4 shrink-0 text-[#25D366]" />
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:underline">{WHATSAPP_DISPLAY}</a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <a href={`mailto:${email}`} className="hover:underline">{email}</a>
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <span>Enquiries answered within one business day (Singapore time)</span>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
