# Annotation-layer

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const annotation_layer = ref(false)
const { pdf } = usePDF('example_014.pdf')
</script>

<template>
  <div style="text-align: center">
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

const annotation_layer = ref(false)
const { pdf } = usePDF('/example_014.pdf')
</script>

<div style="text-align: center">
  <div>
    <button class="button-example" @click="annotation_layer = !annotation_layer">
      Change to <strong>{{ !annotation_layer }}</strong>
    </button>
  </div>
  <VuePDF :pdf="pdf" :annotation-layer="annotation_layer" />
</div>

<style>
.button-example {
  background-color: var(--c-brand);
  color: white;
  padding: 10px;
  margin: 7px;
  border-radius: 2px;
  border: none;
}
</style>