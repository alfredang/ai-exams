import type { Metadata } from 'next';

// Next replaces the root layout's openGraph and twitter blocks wholesale when a
// page sets its own, so a page that sets only a title silently loses the image
// and keeps the site-wide Twitter title. Public pages build their metadata here.

/** Generated 1200×630 site card (src/app/og/site/route.tsx). */
export const SITE_OG_IMAGE = '/og/site';
export const SITE_NAME = 'Tertiary Exams';
const OG_LOCALE = 'en_SG';

export function pageMeta({ title, description, keywords, path, image = SITE_OG_IMAGE, noindex = false }: {
  title: string;
  description: string;
  keywords?: string | null;
  /** Site-relative canonical path. */
  path: string;
  image?: string;
  /** Keep the page working for anyone with the link, but out of search results. */
  noindex?: boolean;
}): Metadata {
  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: 'website', siteName: SITE_NAME, locale: OG_LOCALE, images: [image] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
    ...(noindex ? { robots: { index: false, follow: true } } : {})
  };
}
