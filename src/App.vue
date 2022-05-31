<template>
  <div v-for="page in pages" :key="page"  >
    <VuePDF :pdf="pdf" :page="page" annotation-layer text-layer  />
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
    const onProgress = ({loaded, total}) => {
      console.log(`${loaded/total*100}% Loaded`);
    }

    // const onPassword = (updatePassword, _) => {
    //   updatePassword('password')
    // }

    const {pdf, pages, info} = PDFProxy("popup.pdf", {onProgress: onProgress})

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