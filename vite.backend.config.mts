import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: true,
    minify: false,
    outDir: 'dist/backend',
    rolldownOptions: {
      output: {
        chunkFileNames: '[name].js',
        entryFileNames: 'index.js',
        format: 'cjs',
      },
    },
    sourcemap: true,
    ssr: resolve(import.meta.dirname, 'src/index.ts'),
    target: 'node24',
  },
  ssr: {
    noExternal: true,
  },
});
