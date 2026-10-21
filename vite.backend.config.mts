import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { getBuildInfo } from './build-info.mts';

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
  define: {
    __BUILD_INFO__: JSON.stringify(getBuildInfo(import.meta.dirname)),
  },
  ssr: {
    noExternal: true,
  },
});
