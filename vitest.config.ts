import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@simplicion/ui': path.resolve(__dirname, 'packages/ui/src'),
      '@simplicion/tenant': path.resolve(__dirname, 'packages/domain/tenant/src'),
      '@simplicion/catalog': path.resolve(__dirname, 'packages/domain/catalog/src'),
      '@simplicion/assessment': path.resolve(__dirname, 'packages/domain/assessment/src'),
      '@simplicion/commerce': path.resolve(__dirname, 'packages/domain/commerce/src'),
      '@simplicion/identity': path.resolve(__dirname, 'packages/domain/identity/src'),
      '@simplicion/db': path.resolve(__dirname, 'packages/db/src'),
    },
  },
});
