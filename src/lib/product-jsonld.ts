import { PUBLIC_SITE_URL } from './structured-data';
import { STORE_CURRENCY } from './currency';

// Google Merchant listings / Product snippets helpers for the Practice Exam
// and Exam Voucher pages. Google flags a Product without `image` as a
// critical issue, and an Offer without `shippingDetails` /
// `hasMerchantReturnPolicy` as non-critical — even for digital goods. These
// helpers describe the products truthfully: instant electronic delivery at
// no cost, and returns as stated on /p/refund-policy.

// Markets we sell into. Google needs explicit ISO 3166-1 alpha-2 codes for
// `applicableCountry` / `shippingDestination` (no "worldwide" value).
const MARKET_COUNTRIES = [
  'SG', 'MY', 'ID', 'PH', 'TH', 'VN', 'IN', 'HK', 'TW', 'JP', 'KR', 'AU', 'NZ',
  'AE', 'SA', 'QA', 'GB', 'IE', 'DE', 'FR', 'NL', 'US', 'CA'
];

const REFUND_POLICY_URL = `${PUBLIC_SITE_URL}/p/refund-policy`;

export type ProductTier = 'practice' | 'voucher';

/** Absolute URL for a product image: an admin-set OG image wins, else the generated card. */
export function productImageUrl(bundleSlug: string, tier: ProductTier, override?: string | null): string {
  if (override) return override.startsWith('http') ? override : `${PUBLIC_SITE_URL}${override.startsWith('/') ? '' : '/'}${override}`;
  // Served outside /api/ — robots.txt disallows /api/, and Google must be able to crawl the image.
  return `${PUBLIC_SITE_URL}/og/product/${encodeURIComponent(bundleSlug)}${tier === 'voucher' ? '?tier=voucher' : ''}`;
}

function days(min: number, max: number) {
  return { '@type': 'QuantitativeValue', minValue: min, maxValue: max, unitCode: 'DAY' };
}

/**
 * `shippingDetails` + `hasMerchantReturnPolicy` for an Offer.
 * - Practice Exam: unlocks instantly; full refund within 7 days (fewer than 10 questions answered).
 * - Exam Voucher: code emailed in 3–5 business days; non-refundable once the code is delivered,
 *   so it's declared as no returns rather than over-promising a return window.
 */
export function digitalOfferPolicies(tier: ProductTier) {
  return {
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: STORE_CURRENCY },
      shippingDestination: MARKET_COUNTRIES.map((addressCountry) => ({ '@type': 'DefinedRegion', addressCountry })),
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: days(0, 0),
        transitTime: tier === 'voucher' ? days(3, 5) : days(0, 0)
      }
    },
    hasMerchantReturnPolicy: tier === 'voucher'
      ? {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: MARKET_COUNTRIES,
          returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
          merchantReturnLink: REFUND_POLICY_URL
        }
      : {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: MARKET_COUNTRIES,
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 7,
          returnFees: 'https://schema.org/FreeReturn',
          refundType: 'https://schema.org/FullRefund',
          merchantReturnLink: REFUND_POLICY_URL
        }
  };
}

type RatingSummary = { average: number; count: number };
type ReviewRow = { rating: number; title: string | null; body: string | null; createdAt: Date; user: { name: string | null } };

/** Real, approved reviews only — never emit placeholder ratings (Google policy). */
export function ratingJsonLd(summary: RatingSummary, reviews: ReviewRow[], fallbackName: string) {
  const out: Record<string, unknown> = {};
  if (summary.count > 0) {
    out.aggregateRating = { '@type': 'AggregateRating', ratingValue: summary.average, reviewCount: summary.count, bestRating: 5, worstRating: 1 };
  }
  if (reviews.length > 0) {
    out.review = reviews.map((r) => ({
      '@type': 'Review',
      name: r.title || `Review of ${fallbackName}`,
      reviewBody: r.body || undefined,
      datePublished: r.createdAt.toISOString().slice(0, 10),
      author: { '@type': 'Person', name: r.user.name || 'Anonymous learner' },
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 }
    }));
  }
  return out;
}

export const APPROVED_REVIEW_SELECT = {
  rating: true, title: true, body: true, createdAt: true, user: { select: { name: true } }
} as const;
