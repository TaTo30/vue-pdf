# FreeText Editor

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF, PDFFreeTextAnnotation } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF('https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf')

const colorOptions = ['#2196F3', '#F44336', '#4CAF50', '#FF9800', '#9C27B0']
const color = ref('#2196F3')
const fontSize = ref(20)
</script>

<template>
  <div>
    <div>
      <select v-model="color">
        <option v-for="c in colorOptions" :key="c" :value="c">{{ c }}</option>
      </select>
      <input v-model.number="fontSize" type="range" min="8" max="72" />
      {{ fontSize }}px
    </div>
    <VuePDF :pdf="pdf" text-layer annotation-layer editor-layer :editor-type="3">
      <template #editors>
        <PDFFreeTextAnnotation :color="color" :fontSize="fontSize" />
      </template>
    </VuePDF>
  </div>
</template>
```
<ClientOnly>
  <EditorFreeText />
</ClientOnly>
