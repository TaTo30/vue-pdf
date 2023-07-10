# Loaded Event

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const { pdf } = usePDF('/example_014.pdf')
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
  <Loaded />
</ClientOnly>