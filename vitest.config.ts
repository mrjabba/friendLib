import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.test.ts', '**/*.test.tsx'],
    coverage: {
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      include: [
        'app/**/*.ts',
        'app/**/*.tsx',
        'components/**/*.ts',
        'components/**/*.tsx',
        'i18n/**/*.ts',
        'i18n/**/*.tsx',
        'lib/**/*.ts',
        'db/**/*.ts',
      ],
      thresholds: {
        lines: 65,
        branches: 80,
        functions: 70,
        statements: 65,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      // Transitive Next.js dependency that Vitest cannot resolve; inert in tests.
      'server-only': resolve(__dirname, './test/stubs/server-only.ts'),
    },
  },
})
