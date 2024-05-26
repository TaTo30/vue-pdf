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
  plugins: [
    vue(),
  ],
})
