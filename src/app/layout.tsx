import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { Nav } from '@/components/nav';
import { Footer, PersistentCopyright } from '@/components/footer';
import { FooterGate } from '@/components/footer-gate';
import { WhatsAppWidget } from '@/components/whatsapp-widget';
import { AuthProvider } from '@/components/session-provider';
import { getAllSettings } from '@/lib/settings';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Social card image used by openGraph + twitter metadata. Defaults to
// /hero.webp (already in /public, 200 on prod). When a dedicated
// 1200×630 PNG lands at /public/og-image.png, social scrapers will
// prefer it via array order (Next.js emits both <meta> tags).
const SOCIAL_IMAGE_PRIMARY = '/og-image.png';
const SOCIAL_IMAGE_FALLBACK = '/hero.webp';

// Absolute base for OG/Twitter image URLs and canonical links. Without this,
// Next emits relative image paths and some social scrapers fail to resolve
// them. Mirrors the base resolution used by robots.ts / sitemap.
const SITE_URL =
  process.env.NEXTAUTH_URL?.replace(/\/$/, '') || 'https://exams.tertiaryinfotech.com';

export async function generateMetadata(): Promise<Metadata> {
  const fallbackTitle = 'Tertiary Exams — Practice Smarter for Your Next Certification';
  const fallbackDescription =
    'Original, blueprint-aligned practice questions for AWS, Microsoft, Cisco, CompTIA, Google Cloud, Kubernetes, Anthropic and more. By Tertiary Infotech Academy.';
  const fallbackOgDescription = 'Original practice exams for IT certifications by Tertiary Infotech Academy.';
  const fallbackKeywords =
    'IT certification practice exams, AWS practice exam, Azure practice exam, CompTIA practice exam, Cisco practice exam, Google Cloud practice exam, Kubernetes practice exam, CKAD, CKA, SAA-C03, AZ-900, exam voucher, Tertiary Infotech Academy, Tertiary Exams';
  const siteName = 'Tertiary Exams';

  try {
    const s = await getAllSettings();
    const title = s.SITE_HOME_TITLE || fallbackTitle;
    const ogTitle = s.SITE_HOME_TITLE || siteName;
    const ogDescription = s.SITE_HOME_DESCRIPTION || fallbackOgDescription;
    return {
      metadataBase: new URL(SITE_URL),
      alternates: { canonical: '/' },
      title,
      description: s.SITE_HOME_DESCRIPTION || fallbackDescription,
      keywords: s.SITE_HOME_KEYWORDS || fallbackKeywords,
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        type: 'website',
        siteName,
        images: [
          { url: SOCIAL_IMAGE_PRIMARY, width: 1200, height: 630, alt: ogTitle },
          { url: SOCIAL_IMAGE_FALLBACK, width: 1200, height: 630, alt: ogTitle }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description: ogDescription,
        images: [SOCIAL_IMAGE_PRIMARY, SOCIAL_IMAGE_FALLBACK]
      }
    };
  } catch {
    return {
      metadataBase: new URL(SITE_URL),
      alternates: { canonical: '/' },
      title: fallbackTitle,
      description: fallbackDescription,
      keywords: fallbackKeywords,
      openGraph: {
        title: siteName,
        description: fallbackOgDescription,
        type: 'website',
        siteName,
        images: [
          { url: SOCIAL_IMAGE_PRIMARY, width: 1200, height: 630, alt: siteName },
          { url: SOCIAL_IMAGE_FALLBACK, width: 1200, height: 630, alt: siteName }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: siteName,
        description: fallbackOgDescription,
        images: [SOCIAL_IMAGE_PRIMARY, SOCIAL_IMAGE_FALLBACK]
      }
    };
  }
}

// Runs synchronously in <head> before paint to avoid a flash of the wrong
// theme. Respects (1) explicit localStorage('theme'), then (2) the OS
// prefers-color-scheme media query. Falls back to light when neither is set.
const themeInitScript = `(function(){try{
  var t=localStorage.getItem('theme');
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var d = t ? (t==='dark') : prefersDark;
  if (d) document.documentElement.classList.add('dark');
} catch(e) {}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Plausible Analytics is privacy-friendly (no cookies, no personal data),
  // so it doesn't require a cookie consent banner under GDPR/ePrivacy. The
  // script is only injected if NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set in the
  // env, so dev / preview / pre-launch envs run analytics-free by default.
  // Set the env to the bare domain (e.g. "exams.tertiaryinfotech.com").
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Script id="theme-init" strategy="beforeInteractive">{themeInitScript}</Script>
        <script
          type="application/ld+json"
          // Site-wide Organization + WebSite structured data. Helps Google
          // render a knowledge panel and the sitelinks search box.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'Tertiary Exams',
                legalName: 'Tertiary Infotech Academy Pte Ltd',
                url: SITE_URL,
                logo: `${SITE_URL}/logo-mark.png`
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Tertiary Exams',
                url: SITE_URL,
                potentialAction: {
                  '@type': 'SearchAction',
                  target: `${SITE_URL}/practice-exams?q={search_term_string}`,
                  'query-input': 'required name=search_term_string'
                }
              }
            ])
          }}
        />
        {plausibleDomain && (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
        <AuthProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <FooterGate>
            <Footer />
          </FooterGate>
          <PersistentCopyright />
          <WhatsAppWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
