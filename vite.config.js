import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(import.meta.dirname),
  build: {
    outDir: 'dist'
  },
  server: {
    port: 3000
  },
});
