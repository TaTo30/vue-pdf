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

<div style="text-align: center">
  <VuePDF :pdf="pdf"  @loaded="onLoaded" />
</div>
```
<div class="language-json" data-ext="json">
    <pre class="language-json"><code>{{ eventValue }}</code></pre>
</div>

<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import { withBase } from '@vuepress/client'

const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
const eventValue = ref({})
function onLoaded(value) {
  console.log(value)
  eventValue.value = value
}
</script>

<div style="text-align: center">
  <VuePDF :pdf="pdf" @loaded="onLoaded" />
</div>
