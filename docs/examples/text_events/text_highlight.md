# Highlight Event

::: warning
Highlight event's payload has too many data to display on screen, open the console to see the results.
:::

```vue
<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'
import { ref } from 'vue'

const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')

const highlightText = ref('Trace-based')
const highlightOptions = ref({
  completeWords: false,
  ignoreCase: true,
})

function onHighlight(value) {
  console.log(value)
}
</script>

<template>
  <div>
    <input v-model="highlightText">
    <VuePDF :pdf="pdf" text-layer :highlight-text="highlightText" :highlight-options="highlightOptions" @highlight="onHighlight" />
  </div>
</template>
```

<ClientOnly>
  <TextHighlight />
</ClientOnly>