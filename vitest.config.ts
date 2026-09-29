import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Mirrors tsconfig paths "@/*" -> "./src/*" so lib + hooks resolve
    // identically under vitest and Next.
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['__tests__/**/*.test.ts', 'src/**/*.test.ts'],
  },
});
