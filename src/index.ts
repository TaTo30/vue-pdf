import type { Plugin } from 'vue'
import VuePDF from './components/VuePDF.vue'

export const VuePDFPlugin: Plugin = {
  install(Vue) {
    Vue.component(VuePDF.name, VuePDF)
  },
}

export * from './components'
export default VuePDFPlugin
