import VuePDF from "./components/VuePDF.vue";

const plugin = {
    install(Vue) {
        Vue.component(VuePDF.name, VuePDF)
    }
}

export { default as PDFProxy } from "./components/VuePDFProxy.js";
export { default as VuePDF} from "./components/VuePDF.vue";

export default plugin

