# Rotation

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const rotation = ref(1)
const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
</script>

<template>
  <div>
    <div>
      <button @click="rotation = rotation - 90">
        -90
      </button>
      <span>{{ rotation }}</span>
      <button @click="rotation = rotation + 90">
        +90
      </button>
    </div>
    <VuePDF :pdf="pdf" :rotation="rotation" />
  </div>
</template>
```

<ClientOnly>
  <Rotation />
</ClientOnly>