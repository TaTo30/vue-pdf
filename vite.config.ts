import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: '@tato30/vue-pdf',
      formats: ['es', 'cjs'],
      fileName: format => `index.${(format === 'cjs' || format === 'commonjs') ? 'cjs' : 'mjs'}`,
    },
    outDir: 'dist/lib',
    sourcemap: true,
    target: 'esnext',
    minify: false,
    rollupOptions: {
      output: {
        exports: 'named',
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
