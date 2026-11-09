import { PUBLIC_SITE_URL } from './structured-data';

/** BreadcrumbList for any public page; Google shows it in place of the URL. */
export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${PUBLIC_SITE_URL}${c.path}` }))
  };
}

// Structured data for the Vendor landing pages (/practice-exams/[vendor],
// /exam-vouchers/[vendor]): the page as a CollectionPage listing each
// Certification, plus its breadcrumb trail.
export function vendorLandingJsonLd({ heading, description, path, crumbs, items }: {
  heading: string;
  description: string;
  path: string;
  crumbs: { name: string; path: string }[];
  items: { name: string; path: string }[];
}) {
  const url = (p: string) => `${PUBLIC_SITE_URL}${p}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: heading,
      description,
      url: url(path),
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: items.length,
        itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, url: url(item.path) }))
      }
    },
    breadcrumbJsonLd(crumbs)
  ];
}
