import { fileURLToPath } from 'node:url'
import { defineConfig, mergeConfig } from 'vite'
import commonConfig from '../../vite.config'

export default mergeConfig(
  commonConfig,
  defineConfig({
    resolve: {
      alias: {
        '@tato30/vue-pdf': fileURLToPath(
          new URL('../vue-pdf/src', import.meta.url),
        ),
      },
    },
  }),
)
