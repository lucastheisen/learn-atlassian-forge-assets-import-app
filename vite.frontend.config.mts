import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    emptyOutDir: true,
    modulePreload: false,
    outDir: resolve(import.meta.dirname, 'dist/frontend'),
    sourcemap: true,
  },
  oxc: {
    jsx: {
      runtime: 'classic',
    },
  },
  plugins: [{
    name: 'forge-ui-kit-scripts',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        // Forge loads UI Kit scripts from the body rather than the head.
        const scriptPattern = /<script\b[^>]*\bsrc="[^"]+"[^>]*><\/script>/g;
        const scripts = html.match(scriptPattern) ?? [];
        return html.replace(scriptPattern, '').replace('</body>', `${scripts.join('\n')}\n</body>`);
      },
    },
  }],
  root: resolve(import.meta.dirname, 'src/frontend'),
});
