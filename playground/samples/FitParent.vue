<script setup lang="ts">
import { ref } from 'vue';
import { VuePDF, usePDF } from '../../src';

import pdf014 from '../pdf/_pdf4.pdf';

const { pdf } = usePDF(pdf014)

const width = ref(1000)
const vuePDFRef = ref(null)

function reloadPage() {
  width.value = width.value + 20
  vuePDFRef.value.reload()
}
</script>

<template>
  <button @click="reloadPage()">
    Add 20px
  </button>

  <div :style="`width: ${width}px;`">
    <VuePDF ref="vuePDFRef" :pdf="pdf" fit-parent text-layer annotation-layer image-resources-path="https://unpkg.com/pdfjs-dist@3.7.107/web/images/" />
  </div>
</template>

<style>

</style>
