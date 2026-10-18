import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1b4fd8',
          50: '#eef3fe', 100: '#e3eafc', 500: '#3b6cf0', 600: '#1b4fd8', 700: '#163fb0'
        },
        // Exam-booklet tokens shared by the runner, results and marketing
        // surfaces: cool grey canvas, white surfaces, navy test-centre chrome.
        canvas: '#eef1f4',
        ink: '#131c26',
        muted: '#5a6776',
        line: '#d3dae2',
        navy: { DEFAULT: '#1d3557', 600: '#25446d', 800: '#15263f' }
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'Menlo', 'monospace']
      },
      boxShadow: {
        card: '0 1px 2px rgb(19 28 38 / 0.04), 0 1px 3px rgb(19 28 38 / 0.06)',
        lift: '0 12px 32px -12px rgb(19 28 38 / 0.18), 0 2px 6px rgb(19 28 38 / 0.06)'
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
