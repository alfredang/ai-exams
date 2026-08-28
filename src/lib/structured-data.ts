/** Serialize JSON-LD without allowing CMS/user text to terminate the script tag. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export const PUBLIC_SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.APP_URL ||
  'https://exams.tertiaryinfotech.com'
).replace(/\/$/, '');
