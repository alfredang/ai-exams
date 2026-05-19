import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    ignores: [
      '.next/**',
      'build/**',
      'coverage/**',
      'dist/**',
      'node_modules/**',
      'next-env.d.ts',
      'tsconfig.tsbuildinfo',
      'prisma/migrations/**',
      'scripts/generated-seeds/**',
      'src/lib/seed/**'
    ]
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react/no-unescaped-entities': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  }
];

export default config;
