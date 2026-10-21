import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    __BUILD_INFO__: JSON.stringify({ buildId: 'unit-test', version: 'unit-test' }),
  },
  test: {
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/types/**", "src/version.ts"],
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
