import type { ComponentType, ReactNode } from 'react';
import Link from 'next/link';
import { MapPin, Mail, Phone } from 'lucide-react';
import { getCompanyInfo } from '@/lib/settings';
import { getFooterPages } from '@/lib/pages';

const APP_STORE_URL = 'https://apps.apple.com/us/app/tertiary-ai-exams/id6781995308';
const APP_STORE_BADGE =
  'https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83';
const WHATSAPP_URL = 'https://wa.me/6588666375';
const WHATSAPP_LABEL = '+65 8866 6375';

// Useful Links resolve their titles from CMS footer pages, falling back to
// these labels (and preserving this order) when a page row is missing.
const USEFUL_LINK_FALLBACKS: Record<string, string> = {
  'how-it-works': 'How it works',
  'about-us': 'About Us',
  'privacy-policy': 'Privacy',
  'refund-policy': 'Refund Policy'
};

const linkClass = 'hover:text-slate-900 hover:underline dark:hover:text-slate-100';

async function safeCompany() {
  try {
    return await getCompanyInfo();
  } catch {
    return { name: 'Tertiary Infotech Academy Pte Ltd', shortName: 'ExamNova', uen: '', address: '', email: '', tel: '', website: '' };
  }
}

async function safeFooterPages() {
  try {
    return await getFooterPages();
  } catch {
    return [] as Awaited<ReturnType<typeof getFooterPages>>;
  }
}

function FooterHeading({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h4 className={`text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white ${className}`}>
      {children}
    </h4>
  );
}

/** WhatsApp glyph, inline so we don't depend on a brand-icon pack. */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.01 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.46 1.73 6.4L3.2 28.8l6.56-1.72a12.74 12.74 0 0 0 6.25 1.6h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.64-3.75-9.06A12.7 12.7 0 0 0 16.01 3.2Zm0 23.04h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.02 1.05 1.07-3.92-.25-.4a10.6 10.6 0 0 1-1.63-5.66c0-5.86 4.78-10.62 10.64-10.62 2.84 0 5.5 1.11 7.51 3.12a10.55 10.55 0 0 1 3.11 7.51c0 5.86-4.77 10.63-10.63 10.63Zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.97-2.35-.26-.62-.52-.54-.71-.55l-.6-.01c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.64 0 1.56 1.13 3.06 1.29 3.27.16.21 2.23 3.41 5.4 4.78.75.32 1.34.52 1.8.66.76.24 1.44.21 1.98.13.6-.09 1.89-.77 2.16-1.52.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

/** One contact row: leading icon + optional link. External links open in a new tab. */
function Contact({
  icon: Icon,
  href,
  children
}: {
  icon: ComponentType<{ className?: string }>;
  href?: string;
  children: ReactNode;
}) {
  const external = href?.startsWith('http');
  return (
    <li className="flex items-start gap-2 leading-relaxed">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      {href ? (
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className={linkClass}
        >
          {children}
        </a>
      ) : (
        <span>{children}</span>
      )}
    </li>
  );
}

/**
 * Full public-site footer with brand / links / company / legal columns.
 * Rendered on marketing surfaces (homepage, /practice-exams/*, etc.) — admin
 * and app-shell routes hide it via <FooterGate>. The compact "© 2026 …" line
 * lives in <PersistentCopyright> and is shown on every page.
 */
export async function Footer() {
  const [company, footerPages] = await Promise.all([safeCompany(), safeFooterPages()]);

  const pageBySlug = new Map(footerPages.map((p) => [p.slug, p]));
  const usefulLinks = [
    { href: '/practice-exams', label: 'Browse exams' },
    ...Object.entries(USEFUL_LINK_FALLBACKS).map(([slug, fallback]) => ({
      href: `/p/${slug}`,
      label: pageBySlug.get(slug)?.title ?? fallback
    }))
  ];

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="container-app grid grid-cols-1 gap-x-8 gap-y-10 py-12 sm:grid-cols-2 md:grid-cols-12">
        {/* Brand */}
        <div className="sm:col-span-2 md:col-span-4">
          <div className="mb-3 flex items-center gap-2">
            <img src="/logo-mark.png" alt="Tertiary Exams" className="h-10 w-10 shrink-0 object-contain" />
            <span className="text-base font-semibold text-slate-900 dark:text-white">Tertiary Exams</span>
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Practice smarter for your next certification.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Original, blueprint-aligned practice questions — written by domain experts, with explanations and citations.
            No brain dumps.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Bundle multiple full-length practice exams with an optional discounted real-exam voucher — one purchase, full
            prep to test day.
          </p>
        </div>

        {/* Useful Links */}
        <nav className="md:col-span-2" aria-label="Footer">
          <FooterHeading>Useful Links</FooterHeading>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            {usefulLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Company */}
        <div className="md:col-span-3">
          <FooterHeading>Company</FooterHeading>
          <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="font-medium text-slate-700 dark:text-slate-300">{company.name}</li>
            {company.address && <Contact icon={MapPin}>{company.address}</Contact>}
            {company.email && (
              <Contact icon={Mail} href={`mailto:${company.email}`}>
                {company.email}
              </Contact>
            )}
            {company.tel && (
              <Contact icon={Phone} href={`tel:${company.tel.replace(/\s+/g, '')}`}>
                {company.tel}
              </Contact>
            )}
            <Contact icon={WhatsAppIcon} href={WHATSAPP_URL}>
              {WHATSAPP_LABEL}
            </Contact>
          </ul>
        </div>

        {/* Legal + app */}
        <div className="md:col-span-3">
          <FooterHeading>Legal</FooterHeading>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Original practice questions for learning and exam preparation. Not affiliated with AWS, Microsoft, Cisco,
            CompTIA, Google Cloud, or other certification owners unless explicitly stated. We do not provide real exam
            dumps.
          </p>
          <FooterHeading className="mt-6">Get the app</FooterHeading>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block rounded-lg transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            aria-label="Download Tertiary AI Exams on the App Store"
          >
            <img src={APP_STORE_BADGE} alt="Download on the App Store" className="h-10 w-auto" />
          </a>
        </div>
      </div>
    </footer>
  );
}

/**
 * Single-line copyright shown on every page (frontend + backend). The full
 * multi-column <Footer> above is gated to the public surface via <FooterGate>.
 */
export async function PersistentCopyright() {
  const company = await safeCompany();
  return (
    <div className="border-t border-slate-200 bg-slate-50 py-2 text-center text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      © {new Date().getFullYear()} {company.name}. All rights reserved.{' '}
      <span className="powered-by">
        Powered by{' '}
        <a
          href="https://www.tertiaryinfotech.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
        >
          Tertiary Infotech Academy Pte Ltd
        </a>
      </span>
    </div>
  );
}
