# Ink Editor

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF, PDFInkAnnotation } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF('https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf')

const colorOptions = ['#F44336', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0']
const color = ref('#F44336')
const thickness = ref(5)
const opacity = ref(1.0)
</script>

<template>
  <div>
    <div>
      <select v-model="color">
        <option v-for="c in colorOptions" :key="c" :value="c">{{ c }}</option>
      </select>
      <input v-model.number="thickness" type="range" min="1" max="40" />
      Thickness: {{ thickness }}
      <input v-model.number="opacity" type="range" min="0" max="1" step="0.05" />
      Opacity: {{ opacity }}
    </div>
    <VuePDF :pdf="pdf" text-layer annotation-layer editor-layer :editor-type="15">
      <template #editors>
        <PDFInkAnnotation :color="color" :thickness="thickness" :opacity="opacity" />
      </template>
    </VuePDF>
  </div>
</template>
```
<ClientOnly>
  <EditorInk />
</ClientOnly>
