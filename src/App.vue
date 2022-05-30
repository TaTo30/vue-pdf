<template>
  <div v-for="page in pages" :key="page"  >
    <VuePDF :pdf="pdf" :page="page"   />
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
    const onProgress = (cb) => {
      // console.log(cb);
    }

    const onPassword = (updatePassword, _) => {
      updatePassword('password')
    }

    const {pdf, pages, info} = PDFProxy("./popup.pdf", onProgress, onPassword)


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