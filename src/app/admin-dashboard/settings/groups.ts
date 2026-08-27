export type FieldDef = {
  key: string;
  label: string;
  secret?: boolean;
  placeholder?: string;
  /** When true, the field spans the full width of the grid row. */
  fullWidth?: boolean;
  /** When true, renders as a textarea (needed for multi-line values like PEM keys). */
  multiline?: boolean;
};

export type SettingsGroup = {
  slug: string; // route slug under /admin-dashboard/settings/<slug>
  title: string;
  description?: string;
  compact?: boolean; // 3-col grid when true (used for short labelled fields)
  fields: FieldDef[];
};

// PayPal, HitPay, PayNow sub-groups shown as collapsible cards on the
// Payment Setting page. Each group bundles enabled toggle, environment,
// merchant identifiers AND the corresponding secrets so admins manage
// one provider at a time without bouncing across pages.
export const PAYMENT_SUBGROUPS: SettingsGroup[] = [
  {
    slug: 'paypal',
    title: 'PayPal',
    fields: [
      { key: 'PAYPAL_ENABLED', label: 'Enabled (true/false)', placeholder: 'true' },
      { key: 'PAYPAL_ENV', label: 'Environment', placeholder: 'sandbox or live' },
      { key: 'PAYPAL_CLIENT_ID', label: 'Client ID (OAuth)' },
      { key: 'PAYPAL_CLIENT_SECRET', label: 'Client Secret (OAuth)', secret: true },
      { key: 'PAYPAL_WEBHOOK_ID', label: 'Webhook ID', secret: true }
    ]
  },
  {
    slug: 'hitpay',
    title: 'HitPay',
    fields: [
      { key: 'HITPAY_ENABLED', label: 'Enabled (true/false)', placeholder: 'true' },
      { key: 'HITPAY_ENV', label: 'Environment', placeholder: 'sandbox or live' },
      { key: 'HITPAY_API_KEY', label: 'API Key', secret: true },
      { key: 'HITPAY_SALT', label: 'Salt / Webhook Secret', secret: true }
    ]
  },
  {
    slug: 'stripe',
    title: 'Stripe',
    fields: [
      { key: 'STRIPE_ENABLED', label: 'Enabled (true/false)', placeholder: 'true' },
      { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', label: 'Publishable Key' },
      { key: 'STRIPE_SECRET_KEY', label: 'Secret Key', secret: true },
      { key: 'STRIPE_WEBHOOK_SECRET', label: 'Webhook Secret', secret: true }
    ]
  },
  {
    slug: 'paynow',
    title: 'PayNow',
    fields: [
      { key: 'PAYNOW_ENABLED', label: 'Enabled (true/false)', placeholder: 'true' },
      { key: 'PAYNOW_MERCHANT_ID', label: 'Merchant ID' },
      { key: 'PAYNOW_UEN', label: 'UEN' },
      { key: 'PAYNOW_BANK', label: 'Bank' },
      { key: 'PAYNOW_QR_LOGO_URL', label: 'QR Logo URL' }
    ]
  }
];

// Fulfillment fields appear on the Payment Setting page above the
// three provider sub-groups — they apply to all providers.
// Note: TEASER_QUESTION_COUNT is intentionally NOT exposed here — the
// free teaser is fixed at exactly 10 questions in code (see
// getTeaserSize() in src/lib/settings.ts). Marketing copy across the
// site references "10 free" verbatim, so the value can't be admin-
// configurable without diverging from the copy.
export const PAYMENT_FULFILLMENT_FIELDS: FieldDef[] = [
  { key: 'VOUCHER_DELAY_DAYS', label: 'Voucher delay (days)', placeholder: '5' },
  { key: 'FULFILLMENT_TIMEZONE', label: 'Fulfillment timezone', placeholder: 'Asia/Singapore' }
];

// Email transport sub-groups shown as collapsible cards on the
// Email Setting page. Mirrors the PAYMENT_SUBGROUPS pattern.
export const EMAIL_GMAIL_FIELDS: FieldDef[] = [
  { key: 'GMAIL_OAUTH_CLIENT_ID', label: 'Google OAuth Client ID' },
  { key: 'GMAIL_OAUTH_CLIENT_SECRET', label: 'Google OAuth Client Secret', secret: true },
  { key: 'GMAIL_OAUTH_SENDER_EMAIL', label: 'Sender Gmail address', placeholder: 'noreply@yourdomain.com' }
];

export const EMAIL_SA_FIELDS: FieldDef[] = [
  { key: 'GMAIL_SA_SENDER_EMAIL', label: 'Sender (impersonated Workspace user)', placeholder: 'sales@yourdomain.com' },
  { key: 'GMAIL_SA_CLIENT_EMAIL', label: 'Service account email', placeholder: 'mailer@project.iam.gserviceaccount.com' },
  {
    key: 'GMAIL_SA_PRIVATE_KEY',
    label: 'Private key (PEM, or paste the entire JSON key file)',
    secret: true,
    fullWidth: true,
    multiline: true,
    placeholder: '-----BEGIN PRIVATE KEY-----\n… or the full JSON downloaded from Google Cloud'
  }
];

export const EMAIL_SMTP_FIELDS: FieldDef[] = [
  { key: 'SMTP_HOST', label: 'SMTP host', placeholder: 'smtp.example.com' },
  { key: 'SMTP_PORT', label: 'SMTP port', placeholder: '587' },
  { key: 'SMTP_SECURE', label: 'Secure (true/false)', placeholder: 'false' },
  { key: 'SMTP_USER', label: 'SMTP user' },
  { key: 'SMTP_PASSWORD', label: 'SMTP password', secret: true }
];

export const EMAIL_COMMON_FIELDS: FieldDef[] = [
  { key: 'EMAIL_FROM', label: 'From address', placeholder: 'Tertiary Exams <noreply@example.com>', fullWidth: true }
];

// Social Login providers — toggled per provider on the dedicated
// /admin-dashboard/settings/social-login page.
export const SOCIAL_GOOGLE_FIELDS: FieldDef[] = [
  { key: 'GOOGLE_OAUTH_ENABLED', label: 'Enabled (true/false)', placeholder: 'true' },
  { key: 'GOOGLE_OAUTH_CLIENT_ID', label: 'Google OAuth Client ID' },
  { key: 'GOOGLE_OAUTH_CLIENT_SECRET', label: 'Google OAuth Client Secret', secret: true }
];

export const SOCIAL_GITHUB_FIELDS: FieldDef[] = [
  { key: 'GITHUB_OAUTH_ENABLED', label: 'Enabled (true/false)', placeholder: 'true' },
  { key: 'GITHUB_OAUTH_CLIENT_ID', label: 'GitHub OAuth Client ID' },
  { key: 'GITHUB_OAUTH_CLIENT_SECRET', label: 'GitHub OAuth Client Secret', secret: true }
];

export const SOCIAL_LINKEDIN_FIELDS: FieldDef[] = [
  { key: 'LINKEDIN_OAUTH_ENABLED', label: 'Enabled (true/false)', placeholder: 'true' },
  { key: 'LINKEDIN_OAUTH_CLIENT_ID', label: 'LinkedIn OAuth Client ID' },
  { key: 'LINKEDIN_OAUTH_CLIENT_SECRET', label: 'LinkedIn OAuth Client Secret', secret: true }
];

export const SOCIAL_MICROSOFT_FIELDS: FieldDef[] = [
  { key: 'MICROSOFT_OAUTH_ENABLED', label: 'Enabled (true/false)', placeholder: 'true' },
  { key: 'MICROSOFT_OAUTH_CLIENT_ID', label: 'Microsoft (Entra) Client ID' },
  { key: 'MICROSOFT_OAUTH_CLIENT_SECRET', label: 'Microsoft (Entra) Client Secret', secret: true },
  { key: 'MICROSOFT_OAUTH_TENANT_ID', label: 'Tenant ID', placeholder: 'common' }
];

export const GROUPS: SettingsGroup[] = [
  {
    slug: 'company',
    title: 'Company Info',
    description: 'Legal entity details used on invoices, vouchers, and emails.',
    compact: true,
    fields: [
      { key: 'COMPANY_NAME', label: 'Company Name', placeholder: 'Tertiary Infotech Academy Pte Ltd' },
      { key: 'COMPANY_SHORT_NAME', label: 'Company Short Name', placeholder: 'Tertiary Infotech Academy' },
      { key: 'COMPANY_UEN', label: 'UEN', placeholder: '201200696W' },
      { key: 'COMPANY_WEBSITE', label: 'Company Website', placeholder: 'https://...' },
      { key: 'COMPANY_EMAIL', label: 'Company Email', placeholder: 'enquiry@tertiaryinfotech.com' },
      { key: 'COMPANY_TEL', label: 'Company Tel', placeholder: '61000613' },
      { key: 'COMPANY_ADDRESS', label: 'Company Address', placeholder: '12 Woodland Square …', fullWidth: true }
    ]
  },
  {
    slug: 'branding',
    title: 'Branding',
    description: 'Logo, colour and support email shown in the email templates and customer touchpoints.',
    compact: true,
    fields: [
      { key: 'BRAND_NAME', label: 'Brand name (emails)', placeholder: 'Tertiary Exams' },
      { key: 'BRAND_LOGO_URL', label: 'Brand logo URL' },
      { key: 'BRAND_PRIMARY_COLOR', label: 'Brand primary color', placeholder: '#2563eb' },
      { key: 'BRAND_SUPPORT_EMAIL', label: 'Brand support email' }
    ]
  },
  {
    slug: 'site-seo',
    title: 'Site SEO',
    description: 'Public homepage meta tags. Used by Google + social previews. Use the AI Assist button on individual exam pages for per-exam SEO.',
    compact: true,
    fields: [
      { key: 'SITE_HOME_TITLE', label: 'Home title (50–70 chars)', placeholder: 'Tertiary Exams — Practice Smarter for Your Next Certification' },
      { key: 'SITE_HOME_DESCRIPTION', label: 'Home description (120–180 chars)', placeholder: 'Original practice questions for AWS, Microsoft, Cisco…', fullWidth: true },
      { key: 'SITE_HOME_KEYWORDS', label: 'Home keywords (comma-separated)', placeholder: 'AWS practice exam, Microsoft AZ-900 practice, Cisco CCNA quiz' }
    ]
  },
  {
    slug: 'tax-invoice',
    title: 'Tax & Invoice',
    description: 'Tax engine, invoice numbering, and SGD-equivalent FX rates for reporting.',
    compact: true,
    fields: [
      { key: 'TAX_ENABLED', label: 'Tax enabled (true/false)', placeholder: 'true' },
      { key: 'TAX_LABEL', label: 'Tax label', placeholder: 'GST' },
      { key: 'TAX_RATE_BPS', label: 'Tax rate (basis points, 900 = 9%)', placeholder: '900' },
      { key: 'TAX_INCLUSIVE', label: 'Tax inclusive in price? (true/false)', placeholder: 'false' },
      { key: 'COMPANY_GST_REG', label: 'GST registration number', placeholder: 'M2-1234567-8' },
      { key: 'INVOICE_PREFIX', label: 'Invoice number prefix', placeholder: 'INV' },
      { key: 'FX_TO_SGD_USD_BPS', label: 'USD → SGD FX (basis points, 13500 = 1.3500)', placeholder: '13500' },
      { key: 'FX_TO_SGD_EUR_BPS', label: 'EUR → SGD FX (basis points)' },
      { key: 'FX_TO_SGD_GBP_BPS', label: 'GBP → SGD FX (basis points)' },
      { key: 'FX_TO_SGD_AUD_BPS', label: 'AUD → SGD FX (basis points)' }
    ]
  },
  {
    slug: 'credentials',
    title: 'Credentials',
    description: 'Non-payment API keys and worker secrets. Payment provider credentials live under Payment Setting.',
    fields: [
      { key: 'ANTHROPIC_API_KEY', label: 'Claude (Anthropic) — API Key', secret: true },
      { key: 'FIRECRAWL_API_KEY', label: 'Firecrawl — API Key', secret: true },
      { key: 'TAVILY_API_KEY', label: 'Tavily — API Key', secret: true },
      { key: 'WORKER_SHARED_SECRET', label: 'Cron worker — shared secret', secret: true }
    ]
  }
];

export function getGroup(slug: string): SettingsGroup | undefined {
  return GROUPS.find((g) => g.slug === slug);
}
