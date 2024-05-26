/// <reference types="vitest" />

import { resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'firefox',
      headless: true,
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      supported: {
        'top-level-await': true,
      },
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: '@tato30/vue-pdf',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue', 'pdfjs-dist'],
      output: {
        exports: 'named',
        globals: {
          'vue': 'vue',
          'pdfjs-dist': 'PDFJS',
        },
      },
    },
  },
  plugins: [vue()],
})
