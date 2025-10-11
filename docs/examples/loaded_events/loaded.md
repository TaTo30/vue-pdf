# Loaded Event

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
function onLoaded(value) {
  console.log(value)
}
</script>

<template>
  <div>
    <VuePDF :pdf="pdf" @loaded="onLoaded" />
  </div>
</template>
```

<ClientOnly>
  <LoadedEvent />
</ClientOnly>