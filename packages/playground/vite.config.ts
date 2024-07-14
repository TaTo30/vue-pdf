import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      supported: {
        'top-level-await': true,
      },
    },
  },
  resolve: {
    alias: {
      '@tato30/vue-pdf': fileURLToPath(new URL('../vue-pdf/src', import.meta.url)),
    },
  },
  plugins: [
    vue(),
  ],
})
