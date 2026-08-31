import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { DEFAULT_PAGES } from '@/lib/pages';

// ISR: CMS pages (about, terms, privacy, refunds, etc.) change rarely.
// 10-min cache is fast enough for admin-driven edits to propagate while
// avoiding a DB hit on every visit to legal/marketing pages.
export const revalidate = 600;

// Pre-render every known CMS page slug (admin-published + built-in
// defaults) at build time. Required for the dynamic segment to be
// ISR-cacheable in Next 15+ — without it, the route falls through to
// fully-dynamic rendering and `revalidate` is ignored.
export async function generateStaticParams() {
  const dbRows = await db.page.findMany({ where: { published: true }, select: { slug: true } });
  const slugs = new Set<string>([...DEFAULT_PAGES.map(p => p.slug), ...dbRows.map(r => r.slug)]);
  return Array.from(slugs).map(slug => ({ slug }));
}

// Falls back to the DEFAULT_PAGES seed content when a page hasn't been
// materialized into the DB yet — avoids a 404 on first visit before an
// admin has opened /admin-dashboard/pages (which triggers seedDefaultPages).
async function loadPage(slug: string) {
  const row = await db.page.findUnique({ where: { slug } });
  if (row && row.published) {
    return { title: row.title, excerpt: row.excerpt, bodyHtml: row.bodyHtml };
  }
  const def = DEFAULT_PAGES.find((p) => p.slug === slug);
  if (def) {
    return { title: def.title, excerpt: def.excerpt, bodyHtml: def.bodyHtml };
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) return { title: 'Not found' };
  return { title: page.title, description: page.excerpt ?? undefined };
}

/**
 * Substitutes admin-content placeholders so pages can reference live config
 * without hardcoding numbers. Supported tokens:
 *   {{TEASER_N}}        → effective teaser size (admin setting, capped at 10)
 *   {{REFUND_DAYS}}     → fixed at 7 for now
 */
async function renderPlaceholders(html: string): Promise<string> {
  if (!/\{\{[A-Z_]+\}\}/.test(html)) return html;
  const { getTeaserSize } = await import('@/lib/settings');
  const teaserN = String(await getTeaserSize());
  return html.replace(/\{\{TEASER_N\}\}/g, teaserN).replace(/\{\{REFUND_DAYS\}\}/g, '7');
}

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) return notFound();
  const bodyHtml = await renderPlaceholders(page.bodyHtml);

  return (
    <div className="container-app max-w-3xl py-12">
      <div className="mb-6 text-sm">
        <Link href="/" className="text-slate-500 hover:underline">← Home</Link>
      </div>
      <article className="prose prose-slate max-w-none dark:prose-invert">
        <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
        {page.excerpt && (
          <p className="mt-1 text-base text-slate-600 dark:text-slate-400">{page.excerpt}</p>
        )}
        <div
          className="mt-6 text-[0.95rem] leading-7 text-slate-700 dark:text-slate-200"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </article>
    </div>
  );
}
