import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname),
  build: {
    outDir: 'dist'
  },
  server: {
    port: 3000
  },
  publicDir: 'public'
});
