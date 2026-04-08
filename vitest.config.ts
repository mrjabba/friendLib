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
        'lib/**/*.ts',
        'db/**/*.ts',
      ],
      thresholds: {
        lines: 15,
        branches: 15,
        functions: 15,
        statements: 15,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
})
