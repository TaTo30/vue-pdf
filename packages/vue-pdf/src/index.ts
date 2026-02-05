import { GlobalWorkerOptions } from "pdfjs-dist";
import PDFWorker from "pdfjs-dist/build/pdf.worker.min?url";

import type { Plugin } from "vue";
import VuePDF from "./components/VuePDF.vue";

function configWorker(wokerSrc: string) {
  GlobalWorkerOptions.workerSrc = wokerSrc;
}

if (!GlobalWorkerOptions?.workerSrc) configWorker(PDFWorker);

export const VuePDFPlugin: Plugin = {
  install(Vue) {
    Vue.component(VuePDF.name!, VuePDF)
  },
}

export * from "./components"
export default VuePDFPlugin
