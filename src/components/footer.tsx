import type { ComponentType, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Mail, Phone } from 'lucide-react';
import { getCompanyInfo } from '@/lib/settings';
import { getFooterPages } from '@/lib/pages';

const APP_STORE_URL = 'https://apps.apple.com/us/app/tertiary-ai-exams/id6781995308';
const APP_STORE_BADGE =
  'https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83';
const WHATSAPP_URL = 'https://wa.me/6588666375';
const WHATSAPP_LABEL = '+65 8866 6375';

function displayPhone(value: string): string {
  const compact = value.replace(/\s+/g, '');
  const singapore = compact.match(/^\+65(\d{4})(\d{4})$/);
  return singapore ? `+65 ${singapore[1]} ${singapore[2]}` : value;
}

// Useful Links resolve their titles from CMS footer pages, falling back to
// these labels (and preserving this order) when a page row is missing.
const USEFUL_LINK_FALLBACKS: Record<string, string> = {
  'how-it-works': 'How it works',
  'about-us': 'About Us',
  'support': 'Support',
  'privacy-policy': 'Privacy',
  'refund-policy': 'Refund Policy',
  'terms': 'Terms of Service'
};

const linkClass = 'hover:text-slate-900 hover:underline dark:hover:text-slate-100';

async function safeCompany() {
  try {
    return await getCompanyInfo();
  } catch {
    return { name: 'Tertiary Infotech Academy Pte Ltd', shortName: 'Tertiary Exams', uen: '', address: '', email: '', tel: '', website: '' };
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
    <li className="leading-relaxed">
      {href ? (
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className={`inline-flex items-start gap-2 rounded-sm underline decoration-slate-400/60 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${linkClass}`}
        >
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span>{children}</span>
        </a>
      ) : (
        <span className="flex items-start gap-2">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span>{children}</span>
        </span>
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
  const pageLink = (slug: string) => ({ href: `/p/${slug}`, label: pageBySlug.get(slug)?.title ?? USEFUL_LINK_FALLBACKS[slug] });
  const columns: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: 'Shop',
      links: [
        { href: '/practice-exams', label: 'Practice Exams' },
        { href: '/exam-vouchers', label: 'Exam Vouchers' },
        { href: '/vendors', label: 'Vendors' }
      ]
    },
    {
      title: 'Help',
      links: [pageLink('how-it-works'), { href: '/#faq', label: 'FAQ' }, pageLink('support'), pageLink('about-us')]
    },
    {
      title: 'Legal',
      links: [pageLink('privacy-policy'), pageLink('refund-policy'), pageLink('terms')]
    }
  ];

  return (
    <footer className="border-t border-line bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="container-app grid grid-cols-2 gap-x-6 gap-y-8 pb-10 pt-10 md:grid-cols-12">
        {/* Brand */}
        <div className="col-span-2 md:col-span-4">
          <div className="mb-3 flex items-center gap-2">
            <Image src="/logo-mark.png" alt="Tertiary Exams" width={40} height={40} className="h-10 w-10 shrink-0 object-contain" />
            <span className="font-display text-lg font-extrabold text-slate-900 dark:text-white">Tertiary Exams</span>
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Prepare with confidence. Get certified.</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Original, blueprint-aligned Practice Exams with explanations — and official Exam Vouchers that include the Practice Exam free. No brain dumps.
          </p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} className="md:col-span-2" aria-label={`Footer ${col.title}`}>
            <FooterHeading>{col.title}</FooterHeading>
            <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={`inline-flex min-h-[32px] items-center ${linkClass}`}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* Contact + app */}
        <div className="col-span-2 md:col-span-2">
          <FooterHeading>Contact</FooterHeading>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {company.email && (
              <Contact icon={Mail} href={`mailto:${company.email}`}>
                {company.email}
              </Contact>
            )}
            {company.tel && (
              <Contact icon={Phone} href={`tel:${company.tel.replace(/\s+/g, '')}`}>
                {displayPhone(company.tel)}
              </Contact>
            )}
            <Contact icon={WhatsAppIcon} href={WHATSAPP_URL}>
              {WHATSAPP_LABEL}
            </Contact>
            {company.address && (
              <Contact icon={MapPin} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`}>
                <span className="block font-medium text-slate-700 dark:text-slate-300">{company.name}</span>
                {company.address}
              </Contact>
            )}
          </ul>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-lg transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            aria-label="Download Tertiary AI Exams on the App Store"
          >
            <Image src={APP_STORE_BADGE} alt="Download on the App Store" width={120} height={40} unoptimized className="h-10 w-auto" />
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
