<template>
  <button @click="updateParentWidth">100 mas</button>
    <div :style="`text-align: center; border: 1px red solid; width: ${parentWidth}px;`" >
      <VuePDF ref="viewer" :pdf="pdf" :page="1" text-layer annotation-layer fit-parent  />
    </div>
</template>

<script>

import {ref, watch} from 'vue'
import usePDF from "./components/usePDF";
import VuePDF from "./components/VuePDF.vue";

export default {
  components: {
    VuePDF
  },
  setup(){
  
    const {pdf, pages, info} = usePDF("example_014.pdf")
  
    const viewer = ref({})
    const parentWidth = ref(600)
    return {
      viewer,
      info,
      pdf,
      parentWidth,
      updateParentWidth: () => {        
        parentWidth.value += 100
        viewer.value.reload()
      },
    }
  }

}
</script>

<style>

</style>