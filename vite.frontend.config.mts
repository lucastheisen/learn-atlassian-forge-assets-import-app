import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    emptyOutDir: true,
    modulePreload: false,
    outDir: resolve(import.meta.dirname, 'dist/frontend'),
    rolldownOptions: {
      input: resolve(import.meta.dirname, 'src/frontend/index.tsx'),
      output: {
        entryFileNames: 'index.js',
      },
    },
    sourcemap: true,
  },
  oxc: {
    jsx: {
      runtime: 'classic',
    },
  },
  root: resolve(import.meta.dirname, 'src/frontend'),
});
