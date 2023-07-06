# Links

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const { pdf } = usePDF('/example_045.pdf')
function onAnnotation(value) {
  console.log(value)
}
</script>

<template>
  <div>
    <VuePDF :pdf="pdf" annotation-layer @annotation="onAnnotation" />
  </div>
</template>
```
<div class="language-json" data-ext="json">
    <pre class="language-json"><code>{{ eventValue }}</code></pre>
</div>

<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import { withBase } from '@vuepress/client'

const { pdf } = usePDF(withBase('/example_045.pdf'))
const eventValue = ref({})
function onAnnotation(value) {
  console.log(value)
  eventValue.value = value
}
</script>

<div class="container">
  <VuePDF :pdf="pdf" annotation-layer @annotation="onAnnotation" />
  <VuePDF :pdf="pdf" :page="6" annotation-layer @annotation="onAnnotation" />
</div>
