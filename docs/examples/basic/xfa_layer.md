# XFA Forms

```vue
<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF({
  url: '/xfa.pdf',
  enableXfa: true,
})
</script>

<template>
  <div class="container">
    <VuePDF :pdf="pdf" />
  </div>
</template>
```
<ClientOnly>
  <XFALayer />
</ClientOnly>