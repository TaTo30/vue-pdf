# Multiples PDF

```vue
<script setup>
import { ref, watch } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import { withBase } from '@vuepress/client'

const currentPdfIndex = ref(0)
const pdfSources = [
  '/example_014.pdf',
  '/example_036.pdf',
  '/example_041.pdf',
  '/example_045.pdf',
  'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
]

// Setting the first (or default) PDF
const { pdf } = usePDF(pdfSources[currentPdfIndex.value])

function nextPdf() {
  let sourceIndex = currentPdfIndex.value + 1
  if (sourceIndex >= pdfSources.length)
    sourceIndex = 0

  const { pdf: newPDFToLoad } = usePDF(pdfSources[sourceIndex]) // Loads the new pdf
  watch(newPDFToLoad, () => {
    // How usePDF returns a promised values, we must wait (watch) for a resolved value before reassign the main pdf ref
    pdf.value = newPDFToLoad.value
    currentPdfIndex.value = sourceIndex
  })
}
</script>

<template>
  <div>
    <div>
      <button @click="nextPdf">
        Next PDF
      </button>
    </div>
    <VuePDF :pdf="pdf" />
  </div>
</template>
```
<script setup>
import { ref, watch } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import { withBase } from '@vuepress/client'


const currentPdfIndex = ref(0)
const pdfSources = [
    withBase('/example_014.pdf'),
    withBase('/example_036.pdf'),
    withBase('/example_041.pdf'),
    withBase('/example_045.pdf'),
    'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
    ]

// Setting the first (or default) PDF
const { pdf } = usePDF(pdfSources[currentPdfIndex.value])

function nextPdf() {
    let sourceIndex = currentPdfIndex.value + 1
    if (sourceIndex >= pdfSources.length) {
        sourceIndex = 0 
    }
    const { pdf: newPDFToLoad} = usePDF(pdfSources[sourceIndex]) // Loads the new pdf
    watch(newPDFToLoad, () => {
        // How usePDF returns a promised values, we must wait (watch) for a resolved value before reassign the main pdf ref
        pdf.value = newPDFToLoad.value
        currentPdfIndex.value = sourceIndex
    })
}
</script>

<div style='text-align: center; left: 50%'>
    <div>
        <button class="button-example" @click="nextPdf">Next PDF</button>
    </div>
    <VuePDF :pdf="pdf" />
</div>
