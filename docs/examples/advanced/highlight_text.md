# Highlight Text

```vue
<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import '@tato30/vue-pdf/style.css';
import { ref } from 'vue';

const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')

const highlightText = ref('javascript')
const highlightOptions = ref({
  completeWords: false,
  ignoreCase: true,
})
</script>

<template>
  <div>
    <div>
      <input v-model="highlightText">
      <input v-model="highlightOptions.completeWords" type="checkbox">
      <input v-model="highlightOptions.ignoreCase" type="checkbox">
    </div>
    <VuePDF :pdf="pdf" text-layer :highlight-text="highlightText" :highlight-options="highlightOptions" />
  </div>
</template>
```
<ClientOnly>
  <HighlightText />
</ClientOnly>
