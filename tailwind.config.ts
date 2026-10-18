import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1d5bf0',
          50: '#eef4ff', 100: '#dde9ff', 200: '#bcd3ff', 300: '#8fb4ff', 400: '#5b8dff',
          500: '#3b72f6', 600: '#1d5bf0', 700: '#1747c4', 800: '#143b9c', 900: '#132f73'
        },
        // Every neutral on the site is `slate`, so the theme lives here: a
        // blue-tinted ramp that reads as light blue at 50–200 (light theme
        // canvases and borders) and as premium deep navy at 800–950 (dark
        // theme surfaces). Lightness order matches Tailwind's default slate,
        // so existing light/dark class pairs keep their contrast.
        slate: {
          50: '#f3f7fe', 100: '#e7effc', 200: '#d2e0f7', 300: '#aec4e8', 400: '#8299c2',
          500: '#5d749e', 600: '#45597f', 700: '#2c3f63', 800: '#182848', 900: '#0e1a33', 950: '#070f22'
        },
        // Theme-aware tokens (CSS variables in globals.css): light values on
        // :root, premium-navy values under .dark, and forced light values
        // inside .light-scope (the exam runner).
        page: 'rgb(var(--c-page) / <alpha-value>)',
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        // Test-centre chrome (runner bars, hero exam window) — same in both themes.
        navy: { DEFAULT: '#15306a', 600: '#1d3f86', 800: '#0e2150' }
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'Menlo', 'monospace']
      },
      boxShadow: {
        card: '0 1px 2px rgb(23 71 196 / 0.05), 0 2px 6px rgb(23 71 196 / 0.06)',
        lift: '0 16px 36px -14px rgb(23 71 196 / 0.28), 0 3px 8px rgb(23 71 196 / 0.08)',
        glow: '0 0 0 1px rgb(91 141 255 / 0.25), 0 10px 30px -10px rgb(59 114 246 / 0.55)'
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        drift: { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(24px,-18px) scale(1.08)' } },
        'fade-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        drift: 'drift 14s ease-in-out infinite',
        'fade-up': 'fade-up .45s ease-out both',
        marquee: 'marquee 40s linear infinite'
      }
    }
  },
  plugins: []
} satisfies Config;
