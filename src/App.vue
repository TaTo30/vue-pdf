<template>
    <VuePDF :pdf="pdf" />
</template>

<script>

import {ref} from 'vue'
import PDFProxy from "./components/VuePDFProxy";
import VuePDF from "./components/VuePDF.vue";

export default {
  components: {
    VuePDF
  },
  setup(){
  
    const textBool = ref(false)
    const {pdf, pages} = PDFProxy("4Identity.pdf")

    return {
      pdf,
      pages,
      textBool,
      annotationEvent: (value) => {
        console.log(value);
      },
      loadedEvent: (value) => {
        console.log(value);
      },
      menos: () => {
        textBool.value = false
      },
      mas: () => {
        textBool.value = true
      }
    }
  }

}
</script>

<style>

</style>