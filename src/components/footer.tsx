import Link from 'next/link';
import { MapPin, Mail, Phone } from 'lucide-react';
import { getCompanyInfo } from '@/lib/settings';
import { getFooterPages } from '@/lib/pages';

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

/**
 * Full public-site footer with brand / company / legal columns. Rendered
 * on marketing surfaces (homepage, /practice-exams/*, etc.) — admin and
 * app-shell routes hide it via <FooterGate>. The compact "© 2026 …" line
 * lives in <PersistentCopyright> and is shown on every page.
 */
export async function Footer() {
  const [company, footerPages] = await Promise.all([safeCompany(), safeFooterPages()]);
  const companyLinks = footerPages.filter((p) => p.footerGroup === 'company');
  const legalLinks = footerPages.filter((p) => p.footerGroup === 'legal');

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="container-app flex flex-col gap-10 py-12 md:flex-row md:items-start md:justify-between md:gap-x-12">
        <div className="md:max-w-sm">
          <div className="mb-3 flex items-center gap-2">
            <img src="/logo-mark.png" alt="Tertiary Exams" className="h-10 w-10 shrink-0 object-contain" />
            <span className="text-base font-semibold text-slate-900 dark:text-white">Tertiary Exams</span>
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Practice smarter for your next certification.</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Original, blueprint-aligned practice questions — written by domain experts, with explanations and citations. No brain dumps.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Bundle multiple full-length practice exams with an optional discounted real-exam voucher — one purchase, full prep to test day.
          </p>
        </div>

        <div className="flex flex-col gap-10 sm:flex-row sm:gap-x-12 lg:gap-x-16">
        <div className="sm:w-56">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Company</h4>
          <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="font-medium text-slate-700 dark:text-slate-300">{company.name}</li>
            {company.address && (
              <li className="flex items-start gap-2 leading-relaxed">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <span>{company.address}</span>
              </li>
            )}
            {company.email && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <a href={`mailto:${company.email}`} className="hover:text-slate-900 hover:underline dark:hover:text-slate-100">
                  {company.email}
                </a>
              </li>
            )}
            {company.tel && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <a href={`tel:${company.tel.replace(/\s+/g, '')}`} className="hover:text-slate-900 hover:underline dark:hover:text-slate-100">
                  {company.tel}
                </a>
              </li>
            )}
            <li className="flex items-center gap-2">
              <svg viewBox="0 0 32 32" className="h-4 w-4 shrink-0 text-slate-400" fill="currentColor" aria-hidden="true">
                <path d="M16.01 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.46 1.73 6.4L3.2 28.8l6.56-1.72a12.74 12.74 0 0 0 6.25 1.6h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.64-3.75-9.06A12.7 12.7 0 0 0 16.01 3.2Zm0 23.04h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.02 1.05 1.07-3.92-.25-.4a10.6 10.6 0 0 1-1.63-5.66c0-5.86 4.78-10.62 10.64-10.62 2.84 0 5.5 1.11 7.51 3.12a10.55 10.55 0 0 1 3.11 7.51c0 5.86-4.77 10.63-10.63 10.63Zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.97-2.35-.26-.62-.52-.54-.71-.55l-.6-.01c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.64 0 1.56 1.13 3.06 1.29 3.27.16.21 2.23 3.41 5.4 4.78.75.32 1.34.52 1.8.66.76.24 1.44.21 1.98.13.6-.09 1.89-.77 2.16-1.52.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
              </svg>
              <a
                href="https://wa.me/6588666375"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900 hover:underline dark:hover:text-slate-100"
              >
                +65 8866 6375
              </a>
            </li>
          </ul>
        </div>

        <div className="sm:w-36">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Useful Links</h4>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>
              <Link href="/practice-exams" className="hover:text-slate-900 hover:underline dark:hover:text-slate-100">
                Browse exams
              </Link>
            </li>
            {(() => {
              const wanted = ['how-it-works', 'about-us', 'privacy-policy', 'refund-policy'];
              const bySlug = new Map(
                [...legalLinks, ...companyLinks].map((p) => [p.slug, p])
              );
              const fallbackTitles: Record<string, string> = {
                'how-it-works': 'How it works',
                'about-us': 'About Us',
                'privacy-policy': 'Privacy',
                'refund-policy': 'Refund Policy'
              };
              return wanted.map((slug) => {
                const p = bySlug.get(slug);
                return (
                  <li key={slug}>
                    <Link href={`/p/${slug}`} className="hover:text-slate-900 hover:underline dark:hover:text-slate-100">
                      {p?.title || fallbackTitles[slug]}
                    </Link>
                  </li>
                );
              });
            })()}
          </ul>
        </div>

        <div className="sm:w-64">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Legal</h4>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Original practice questions for learning and exam preparation. Not affiliated with AWS, Microsoft, Cisco, CompTIA,
            Google Cloud, or other certification owners unless explicitly stated. We do not provide real exam dumps.
          </p>
          <h4 className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Get the app</h4>
          <a
            href="https://apps.apple.com/us/app/tertiary-ai-exams/id6781995308"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block rounded-lg transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            aria-label="Download Tertiary AI Exams on the App Store"
          >
            <img
              src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83"
              alt="Download on the App Store"
              className="h-10 w-auto"
            />
          </a>
        </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Single-line copyright shown on every page (frontend + backend). The
 * full multi-column <Footer> above is gated to the public surface via
 * <FooterGate>.
 */
export async function PersistentCopyright() {
  const company = await safeCompany();
  return (
    <div className="border-t border-slate-200 bg-slate-50 py-2 text-center text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      © {new Date().getFullYear()} {company.name}. All rights reserved.
    </div>
  );
}
