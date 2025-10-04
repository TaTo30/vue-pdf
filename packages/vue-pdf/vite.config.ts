import { resolve } from 'node:path'
import { defineConfig, mergeConfig } from 'vite'
import commonConfig from '../../vite.config'

// https://vitejs.dev/config/
export default mergeConfig(
  commonConfig,
  defineConfig({
    build: {
      lib: {
        entry: resolve(__dirname, './src/index.ts'),
        name: '@tato30/vue-pdf',
        fileName: 'index',
        cssFileName: 'style'
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
  }),
)
