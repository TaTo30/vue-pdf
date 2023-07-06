# Annotation-layer

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'

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
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import { withBase } from '@vuepress/client'

const annotation_layer = ref(false)
const { pdf } = usePDF(withBase('/example_014.pdf'))
</script>

<div class="container">
  <div>
    <button class="button-example" @click="annotation_layer = !annotation_layer">
      Change to <strong>{{ !annotation_layer }}</strong>
    </button>
  </div>
  <VuePDF :pdf="pdf" :annotation-layer="annotation_layer" />
</div>
