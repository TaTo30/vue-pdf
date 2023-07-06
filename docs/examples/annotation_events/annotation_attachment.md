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
    <VuePDF :pdf="pdf" annotation-layer @annotation="onAnnotation" />
  </div>
</template>
```
<div class="language-json" data-ext="json">
    <pre class="language-json"><code>// "content" is a uint8Array<br/>{{ eventValue }}</code></pre>
</div>

<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import { withBase } from '@vuepress/client'

const { pdf } = usePDF(withBase('/example_041.pdf'))
const eventValue = ref({})
function onAnnotation(value) {
  console.log(value)
  eventValue.value = value
}
</script>

<div class="container">
  <VuePDF :pdf="pdf" annotation-layer @annotation="onAnnotation" />
</div>
