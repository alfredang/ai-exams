import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    plugins: {
      'react-hooks': reactHooks
    },
    rules: {
      // The application predates the flat ESLint setup and intentionally uses
      // `any` at API/Prisma boundaries. Tighten these incrementally instead of
      // making the baseline lint command unusable.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'react/no-unescaped-entities': 'off',
      // React 19 compiler-oriented rules flag several established hydration
      // and admin-state patterns. Keep them visible while migrating without
      // blocking the baseline lint command.
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn'
    }
  },
  globalIgnores([
    '.next/**',
    'node_modules/**',
    'output/**',
    'practice-exams-pdfs-*/**',
    'next-env.d.ts'
  ])
]);
