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
      external: [
        'vue',
        'pdfjs-dist',
      ],
      output: {
        exports: 'named',
      },
    },
  },
  plugins: [
    vue(),
  ],
})
