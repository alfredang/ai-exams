// Browser-side Sentry init. Loaded by Next.js exactly once per page lifecycle.
// Import the SDK only when a DSN is configured. A static import adds roughly
// 450 KiB of uncompressed JavaScript to every public page even when Sentry is
// disabled; the dynamic import keeps that code out of the initial route.
//
// We disable BrowserTracing by leaving `integrations` empty — error capture is
// the only thing we want at launch. Tracing in the browser is expensive
// (lots of fetch wraps) and the data isn't actionable until you have
// thousands of pageviews to compare against. Re-enable later if you need it.
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (sentryDsn) {
  void import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn: sentryDsn,
      tracesSampleRate: 0,
      enabled: process.env.NODE_ENV === 'production'
    });
  });
}

// Hook Sentry into Next.js App Router client-side navigation so transitions
// show up as parent spans for errors. Keep this hook lightweight when Sentry
// is disabled and defer the SDK load when it is enabled.
export function onRouterTransitionStart(href: string, navigationType: string) {
  if (!sentryDsn) return;
  void import('@sentry/nextjs').then((Sentry) => {
    Sentry.captureRouterTransitionStart(href, navigationType);
  });
}
