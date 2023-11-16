# Watermark Text

```vue
<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import { ref } from 'vue'

const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')

const pdfRef = ref(null)
const watermarkText = ref('sample')
const watermarkOptions = ref({
  columns: 4,
  rows: 4,
  color: 'rgba(211, 210, 211, 0.8)',
  rotation: 45,
  fontSize: 18,
})

function reload() {
  pdfRef.value.reload()
}
</script>

<template>
  <div>
    <div>
      <input v-model="watermarkText">
      <input v-model="watermarkOptions.color">
      <input v-model="watermarkOptions.columns">
      <input v-model="watermarkOptions.rows">
      <input v-model="watermarkOptions.rotation">
      <input v-model="watermarkOptions.fontSize">
    </div>
    <VuePDF ref="pdfRef" :pdf="pdf" :watermark-text="watermarkText" :watermark-options="watermarkOptions" />
  </div>
</template>
```
<ClientOnly>
  <Watermark />
</ClientOnly>
