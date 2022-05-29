<template>
  <div v-for="page in pages" :key="page" style="text-align: center;" >
    <VuePDF :pdf="pdf" :page="page" text-layer annotation-layer @annotation="annotationEvent" @loaded="loadedEvent" />
  </div>
</template>

<script>

import PDFProxy from "./components/VuePDFProxy";
import VuePDF from "./components/VuePDF.vue";

export default {
  components: {
    VuePDF
  },
  setup(){
    const {pdf, pages} = PDFProxy("./4Identity.pdf")
    return {
      pdf,
      pages,
      annotationEvent: (value) => {
        console.log(value);
      },
      loadedEvent: (value) => {
        console.log(value);
      }
    }
  }

}
</script>

<style>

</style>