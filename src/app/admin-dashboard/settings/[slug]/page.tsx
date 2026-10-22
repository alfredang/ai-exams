import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { COMPANY_DEFAULTS, getAllSettings, SECRET_KEYS, mask } from '@/lib/settings';

// Map COMPANY_* setting keys to the COMPANY_DEFAULTS fields so the
// admin form shows the values actually in effect across the site,
// rather than an empty input that hides the runtime fallback.
const COMPANY_FALLBACKS: Record<string, string> = {
  COMPANY_NAME: COMPANY_DEFAULTS.name,
  COMPANY_SHORT_NAME: COMPANY_DEFAULTS.shortName,
  COMPANY_UEN: COMPANY_DEFAULTS.uen,
  COMPANY_ADDRESS: COMPANY_DEFAULTS.address,
  COMPANY_EMAIL: COMPANY_DEFAULTS.email,
  COMPANY_TEL: COMPANY_DEFAULTS.tel,
  COMPANY_WEBSITE: COMPANY_DEFAULTS.website
};
import SectionForm from '../section-form';
import { getGroup } from '../groups';

export const dynamic = 'force-dynamic';

// 'payment' has a dedicated route at /settings/payment with collapsible
// provider sub-sections, so it's intentionally excluded here.
const VALID_SLUGS = ['company', 'branding', 'credentials', 'tax-invoice', 'site-seo', 'security'];

export default async function SettingsSectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const { slug } = await params;
  if (!VALID_SLUGS.includes(slug)) return notFound();
  const group = getGroup(slug);
  if (!group) return notFound();

  const values = await getAllSettings();
  const initial: Record<string, { configured: boolean; preview: string; current: string }> = {};
  for (const f of group.fields) {
    const stored = values[f.key as keyof typeof values] || '';
    // Fall back to COMPANY_DEFAULTS so the form mirrors what's actually
    // rendered in invoices, vouchers and emails. `configured` stays
    // false when the DB row is empty so the admin still sees the
    // distinction (no SET badge), but the input is pre-filled.
    const fallback = COMPANY_FALLBACKS[f.key] || '';
    const v = stored || fallback;
    const isSecret = SECRET_KEYS.has(f.key as any);
    initial[f.key] = {
      configured: !!stored,
      preview: isSecret ? mask(v) : v,
      current: v
    };
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{group.title}</h1>
      <p className="mt-1 text-sm text-slate-500">{group.description}</p>
      <SectionForm group={group} initial={initial} />
    </div>
  );
}
