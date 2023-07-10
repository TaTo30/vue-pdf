# Annotation-layer

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const annotation_layer = ref(false)
const { pdf } = usePDF('example_014.pdf')
</script>

<template>
  <div>
    <div>
      <button @click="annotation_layer = !annotation_layer">
        Change to {{ !annotation_layer }}
      </button>
    </div>
    <VuePDF :pdf="pdf" :annotation-layer="annotation_layer" />
  </div>
</template>
```

<ClientOnly>
  <AnnotationLayer />
</ClientOnly>