# Forms fields

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const { pdf } = usePDF('/example_014.pdf')
function onAnnotation(value) {
  console.log(value)
}
</script>

<div style="text-align: center">
  <VuePDF :pdf="pdf" annotation-layer @annotation="onAnnotation" />
</div>
```
<div class="language-json" data-ext="json">
    <pre class="language-json"><code>{{ eventValue }}</code></pre>
</div>

<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import { withBase } from '@vuepress/client'

const { pdf } = usePDF(withBase('/example_014.pdf'))
const eventValue = ref({})
function onAnnotation(value) {
  console.log(value)
  eventValue.value = value
}
</script>

<div style="text-align: center">
  <VuePDF :pdf="pdf" annotation-layer @annotation="onAnnotation" />
</div>
