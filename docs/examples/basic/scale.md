# Scale

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const scale = ref(1)
const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
</script>

<template>
  <div>
    <div>
      <button @click="scale = scale > 0.25 ? scale - 0.25 : scale">
        -
      </button>
      <span>{{ scale * 100 }}%</span>
      <button @click="scale = scale < 2 ? scale + 0.25 : scale">
        +
      </button>
    </div>
    <VuePDF :pdf="pdf" :scale="scale" />
  </div>
</template>
```

<ClientOnly>
  <ScalePage />
</ClientOnly>