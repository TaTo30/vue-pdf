import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'firefox',
      headless: true,
    },
  },
  resolve: {
    alias: {
      '@tato30/vue-pdf': fileURLToPath(new URL('../packages/vue-pdf/src', import.meta.url)),
      'samples': fileURLToPath(new URL('../samples', import.meta.url)),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      supported: {
        'top-level-await': true,
      },
    },
  },
  plugins: [vue()],
})
