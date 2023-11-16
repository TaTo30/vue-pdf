# Multiples PDF

```vue
<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import { ref } from 'vue'

const pdfSources = [
  '/example_014.pdf',
  '/example_036.pdf',
  '/example_041.pdf',
  '/example_045.pdf',
  'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
]
// Setting the first (or default) PDF
const pdfSource = ref(pdfSources[0])
const pdfSourceIdx = ref(0)

const { pdf } = usePDF(pdfSource)

function nextPdf() {
  pdfSourceIdx.value += 1
  if (pdfSourceIdx.value >= pdfSources.length)
    pdfSourceIdx.value = 0
  pdfSource.value = pdfSources[pdfSourceIdx.value]
}
</script>

<template>
  <div>
    <div>
      <button @click="nextPdf">
        Next PDF (Current index: {{ pdfSourceIdx }})
      </button>
    </div>
    <VuePDF :pdf="pdf" />
  </div>
</template>
```

<ClientOnly>
  <MultiplePDF />
</ClientOnly>