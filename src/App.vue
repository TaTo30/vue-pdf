<template>
  <div style="text-align: center;">
    <VuePDF  :pdf="pdf" :page="1" @loaded="loadedEvent" @annotation="annotationEvent" annotation-layer />
  </div>
  <div>
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
    const {pdf, pages, info} = usePDF("example_014.pdf")

    return {
      info,
      pdf,
      pages,
      textBool,
      annotationEvent: (value) => {
        console.log(value);
      },
      loadedEvent: (value) => {
        console.log(value);
      },
    }
  }

}
</script>

<style>

</style>