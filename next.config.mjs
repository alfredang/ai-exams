import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const handlebarsBrowserBuild = require.resolve('handlebars/dist/cjs/handlebars.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
  webpack(config) {
    // The package's Node entry registers require.extensions for .hbs files,
    // which webpack cannot support. The CJS browser build includes the same
    // compiler/runtime API without that Node-only registration side effect.
    config.resolve.alias.handlebars = handlebarsBrowserBuild;
    return config;
  },
  async redirects() {
    return [
      // The app uses OTP-based password reset (/forgot-password issues
      // an OTP, /verify-otp consumes it), not a magic-link `/reset-password/<token>`
      // pattern. Anyone landing on /reset-password (from an old bookmark
      // or a generic password-recovery instinct) gets pointed at the right
      // entry point instead of a bare 404.
      { source: '/reset-password', destination: '/forgot-password', permanent: true },
      { source: '/reset-password/:rest*', destination: '/forgot-password', permanent: true },

      // Two Page records ended up published — /p/terms and /p/terms-of-service —
      // both with identical "Terms of Service" content. /p/terms is the
      // canonical (shorter, the one seeded by prisma/seed.ts). Redirect the
      // long form so search engines don't see duplicate content. The DB row
      // for /p/terms-of-service can be soft-deleted later; the redirect
      // catches the URL before the route ever queries the DB. 2026-05-28.
      { source: '/p/terms-of-service', destination: '/p/terms', permanent: true },

      // Legacy /my-content URL was renamed to /user-dashboard during the
      // 2026-05-25 refactor. Internal links were updated, but external
      // bookmarks and old purchase emails still point at /my-content.
      // Redirect so those don't 404.
      { source: '/my-content', destination: '/user-dashboard', permanent: true },
      { source: '/my-content/:rest*', destination: '/user-dashboard/:rest*', permanent: true }
    ];
  }
};
export default nextConfig;
