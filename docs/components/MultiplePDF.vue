<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import { withBase } from 'vitepress/client';
import { ref } from 'vue';

const pdfSources = [
  withBase('/14.pdf'),
  withBase('/36.pdf'),
  withBase('/41.pdf'),
  withBase('/45.pdf'),
  'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
]
const pdfSourceIdx = ref(0)
const pdfSource = ref(pdfSources[0])

// Setting the first (or default) PDF
const { pdf } = usePDF(pdfSource)

function nextPdf() {
  pdfSourceIdx.value += 1
  if (pdfSourceIdx.value >= pdfSources.length)
    pdfSourceIdx.value = 0
  pdfSource.value = pdfSources[pdfSourceIdx.value]
}
</script>

<template>
  <div class="vue-pdf-container">
    <div>
      <button class="button-example" @click="nextPdf">
        Next PDF (Current index: {{ pdfSourceIdx }})
      </button>
    </div>
    <VuePDF :pdf="pdf" />
  </div>
</template>
