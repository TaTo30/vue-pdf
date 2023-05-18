import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: '@tato30/vue-pdf',
      fileName: 'index',
    },
    rollupOptions: {
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
      external: [
        'vue',
        'pdfjs-dist',
        'pdfjs-dist/build/pdf',
        'pdfjs-dist/build/pdf.worker',
        'pdfjs-dist/build/pdf.worker.entry',
        'pdfjs-dist/web/pdf_viewer',
        'pdfjs-dist/web/pdf_viewer.css',
      ],
    },
  },
  plugins: [
    vue(),
  ],
})
