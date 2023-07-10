# File attachment

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const { pdf } = usePDF('/example_041.pdf')
function onAnnotation(value) {
  console.log(value)
}
</script>

<template>
  <div>
    <VuePDF :pdf="pdf" annotation-layer image-resources-path="https://unpkg.com/pdfjs-dist@latest/web/images/" @annotation="onAnnotation" />
  </div>
</template>
```
<ClientOnly>
  <AnnoAttachment />
</ClientOnly>