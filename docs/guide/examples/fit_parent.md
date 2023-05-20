# Fit parent

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')

const vuePDFRef = ref(null)
const parentWidth = ref(300)

function fitParentWidth(pxs) {
  parentWidth.value = parentWidth.value + pxs
  vuePDFRef.value.reload()
}
</script>

<template>
  <div style="text-align: center">
    <div>
      <button class="button-example" @click="fitParentWidth(-50)">
        Remove 50px
      </button>
      <span>Parent width: {{ parentWidth }}px</span>
      <button class="button-example" @click="fitParentWidth(50)">
        Add 50px
      </button>
    </div>
    <div :style="`width: ${parentWidth}px; display: inline-block`">
      <VuePDF ref="vuePDFRef" :pdf="pdf" fit-parent />
    </div>
  </div>
</template>
```
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')

const vuePDFRef = ref(null)
const parentWidth = ref(300)

function fitParentWidth(pxs) {
    parentWidth.value = parentWidth.value + pxs
    vuePDFRef.value.reload()
}
</script>

<div style="text-align: center">
    <div>
        <button class="button-example" @click="fitParentWidth(-50)">Remove 50px</button>
        <span>Parent width: {{parentWidth}}px</span>
        <button class="button-example" @click="fitParentWidth(50)">Add 50px</button>
    </div>
    <div :style="`width: ${parentWidth}px; display: inline-block`">
        <VuePDF ref="vuePDFRef" :pdf="pdf" fit-parent />
    </div>
</div>