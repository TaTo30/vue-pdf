import VuePDF from "./components/VuePDF.vue";

const plugin = {
    install(Vue) {
        Vue.component(VuePDF.name, VuePDF)
    }
}

export { default as usePDF } from "./components/usePDF";
export { default as VuePDF} from "./components/VuePDF.vue";

export default plugin

