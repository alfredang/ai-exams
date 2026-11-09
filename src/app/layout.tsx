import './globals.css';
import type { Metadata } from 'next';
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import Script from 'next/script';
import { Nav } from '@/components/nav';
import { Footer, PersistentCopyright } from '@/components/footer';
import { FooterGate } from '@/components/footer-gate';
import { WhatsAppWidget } from '@/components/whatsapp-widget';
import { AuthProvider } from '@/components/session-provider';
import { CurrencyProvider } from '@/components/currency-provider';
import { getAllSettings } from '@/lib/settings';
import { SITE_OG_IMAGE } from '@/lib/seo-meta';
import { HOME_SEO } from '@/lib/exam-seo';

const display = Archivo({ subsets: ['latin'], weight: ['500', '700', '800'], variable: '--font-display' });
const body = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500'], variable: '--font-mono' });

// Social card image used by openGraph + twitter metadata: the generated
// 1200×630 site card, so it can't go missing the way /og-image.png did.
const SOCIAL_IMAGE = SITE_OG_IMAGE;

// Absolute base for OG/Twitter image URLs and canonical links. Without this,
// Next emits relative image paths and some social scrapers fail to resolve
// them. Mirrors the base resolution used by robots.ts / sitemap.
const SITE_URL =
  process.env.NEXTAUTH_URL?.replace(/\/$/, '') || 'https://exams.tertiaryinfotech.com';

export async function generateMetadata(): Promise<Metadata> {
  const fallbackTitle = HOME_SEO.SITE_HOME_TITLE;
  const fallbackDescription = HOME_SEO.SITE_HOME_DESCRIPTION;
  const fallbackOgDescription = fallbackDescription;
  const fallbackKeywords = HOME_SEO.SITE_HOME_KEYWORDS;
  const siteName = 'Tertiary Exams';

  try {
    const s = await getAllSettings();
    const title = s.SITE_HOME_TITLE || fallbackTitle;
    const ogTitle = s.SITE_HOME_TITLE || fallbackTitle;
    const ogDescription = s.SITE_HOME_DESCRIPTION || fallbackOgDescription;
    return {
      metadataBase: new URL(SITE_URL),
      title,
      description: s.SITE_HOME_DESCRIPTION || fallbackDescription,
      keywords: s.SITE_HOME_KEYWORDS || fallbackKeywords,
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        type: 'website',
        siteName,
        locale: 'en_SG',
        images: [{ url: SOCIAL_IMAGE, width: 1200, height: 630, alt: ogTitle }]
      },
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description: ogDescription,
        images: [SOCIAL_IMAGE]
      }
    };
  } catch {
    return {
      metadataBase: new URL(SITE_URL),
      title: fallbackTitle,
      description: fallbackDescription,
      keywords: fallbackKeywords,
      openGraph: {
        title: siteName,
        description: fallbackOgDescription,
        type: 'website',
        siteName,
        locale: 'en_SG',
        images: [{ url: SOCIAL_IMAGE, width: 1200, height: 630, alt: siteName }]
      },
      twitter: {
        card: 'summary_large_image',
        title: siteName,
        description: fallbackOgDescription,
        images: [SOCIAL_IMAGE]
      }
    };
  }
}

// Runs synchronously in <head> before paint to avoid a flash of the wrong
// theme. The site is light by default: dark applies only when the visitor
// chose it (localStorage 'theme' === 'dark'), or chose 'system' in their
// settings and the OS prefers dark.
const themeInitScript = `(function(){try{
  var t=localStorage.getItem('theme');
  var d = t==='dark' || (t==='system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
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
    <html lang="en-SG" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-page font-sans text-ink dark:text-slate-100">
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
        <CurrencyProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <FooterGate>
            <Footer />
          </FooterGate>
          <PersistentCopyright />
          <WhatsAppWidget />
        </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
