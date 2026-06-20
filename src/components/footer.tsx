import Link from 'next/link';
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
      <div className="container-app grid gap-8 py-10 md:grid-cols-12">
        <div className="md:col-span-4">
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
          <a
            href="https://apps.apple.com/us/app/tertiary-ai-exams/id6781995308"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block"
            aria-label="Download Tertiary AI Exams on the App Store"
          >
            <img
              src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83"
              alt="Download on the App Store"
              className="h-10 w-auto"
            />
          </a>
        </div>

        <div className="md:col-span-5">
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li className="font-medium text-slate-700 dark:text-slate-300">{company.name}</li>
            {company.address && (
              <li className="leading-relaxed">Address: {company.address}</li>
            )}
            {company.email && (
              <li>
                Email:{' '}
                <a href={`mailto:${company.email}`} className="hover:text-slate-900 hover:underline dark:hover:text-slate-100">
                  {company.email}
                </a>
              </li>
            )}
            {company.tel && (
              <li>
                Tel:{' '}
                <a href={`tel:${company.tel.replace(/\s+/g, '')}`} className="hover:text-slate-900 hover:underline dark:hover:text-slate-100">
                  {company.tel}
                </a>
              </li>
            )}
          </ul>
          <h4 className="mt-4 text-sm font-semibold">Legal</h4>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Original practice questions for learning and exam preparation. Not affiliated with AWS, Microsoft, Cisco, CompTIA,
            Google Cloud, or other certification owners unless explicitly stated. We do not provide real exam dumps.
          </p>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-sm font-semibold">Useful Links</h4>
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
