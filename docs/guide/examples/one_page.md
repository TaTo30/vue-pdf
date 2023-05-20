# One page

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const page = ref(1)
const { pdf, pages } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
</script>

<template>
  <div style="text-align: center">
    <div>
      <button @click="page = page > 1 ? page - 1 : page">
        Prev
      </button>
      <span>{{ page }} / {{ pages }}</span>
      <button @click="page = page < pages ? page + 1 : page">
        Next
      </button>
    </div>
    <VuePDF :pdf="pdf" :page="page" />
  </div>
</template>
```
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf';

const page = ref(1)
const { pdf, pages } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
</script>

<div style='text-align: center'>
    <div>
      <button class="button-example" @click="page = page > 1? page - 1 : page">PREV</button>
      <span>{{page}}/{{pages}}</span>
      <button class="button-example" @click="page = page < pages? page + 1 : page">NEXT</button>
    </div>
    <VuePDF :pdf="pdf" :page="page" />
</div>
