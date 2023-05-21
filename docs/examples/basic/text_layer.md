# Text-layer

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const text_layer = ref(false)
const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
</script>

<template>
  <div style="text-align: center">
    <div>
      <button @click="text_layer = !text_layer">
        Change to {{ !text_layer }}
      </button>
    </div>
    <VuePDF :pdf="pdf" :text-layer="text_layer" />
  </div>
</template>
```
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const text_layer = ref(false)
const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
</script>

<div style="text-align: center">
  <div>
    <button class="button-example" @click="text_layer = !text_layer">
      Change to <strong>{{ !text_layer }}</strong>
    </button>
  </div>
  <VuePDF :pdf="pdf" :text-layer="text_layer" />
</div>
