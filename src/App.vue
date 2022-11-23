<template>
  <div style="text-align: center;">
    <VuePDF :pdf="pdf" :page="1" :annotations-filter="filter" @loaded="loadedEvent"  annotation-layer  />
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
    const {pdf, pages, info} = usePDF("popup.pdf")

    return {
      info,
      pdf,
      pages,
      textBool,
      filter: ["Highlight", "Popup"],
      annotationEvent: (value) => {
        console.log(JSON.stringify(value));
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