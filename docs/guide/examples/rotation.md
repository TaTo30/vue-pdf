# Rotation

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const rotation = ref(1)
const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
</script>

<template>
  <div style="text-align: center">
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
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const rotation = ref(0)
const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
</script>

<div style="text-align: center">
  <div>
    <button class="button-example" @click="rotation = rotation - 90">
      - 90°
    </button>
    <span>{{ rotation }}°</span>
    <button class="button-example" @click="rotation = rotation + 90">
      + 90°
    </button>
  </div>
  <VuePDF :pdf="pdf" :rotation="rotation" />
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