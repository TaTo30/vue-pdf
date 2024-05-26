# XFA Loaded Event

```vue
<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF({
  url: '/example_xfa.pdf',
  enableXfa: true,
})
function onLoaded() {
  console.log("XFA loaded")
}
</script>

<template>
  <div>
    <VuePDF :pdf="pdf" @xfa-loaded="onLoaded" />
  </div>
</template>
```

<ClientOnly>
  <XFALoaded />
</ClientOnly>