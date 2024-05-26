# Text Loaded Event

::: warning
Text loaded event's payload has too many data to display on screen, open the console to see the results.
:::

```vue
<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
function onLoaded(value) {
  console.log(value)
}
</script>

<template>
  <div>
    <VuePDF :pdf="pdf" text-layer @text-loaded="onLoaded" />
  </div>
</template>
```

<ClientOnly>
  <TextLoaded />
</ClientOnly>