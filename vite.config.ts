import { resolve } from 'node:path'
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
      '@samples': resolve(__dirname, 'samples'),
    },
  },
  plugins: [vue()],
})
