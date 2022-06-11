<template>
  <div style="text-align: center;">
    <VuePDF :pdf="pdf" :annotation-layer="true" :text-layer="true" @annotation="annotationEvent" />
  </div>
</template>

<script>

import {ref} from 'vue'
import usePDF from "./components/usePDF";
import VuePDF from "./components/VuePDF.vue";

export default {
  components: {
    VuePDF
  },
  setup(){
  
    const textBool = ref(false)
    const {pdf, pages} = usePDF("example_041.pdf")

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