# All pages

```vue
<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const { pdf, pages } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
</script>

<template>
  <div v-for="page in pages" :key="page">
    <VuePDF :pdf="pdf" :page="page" />
  </div>
</template>
```
<script setup>
import { usePDF, VuePDF } from '@tato30/vue-pdf';

const { pdf, pages } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
</script>

<div style="text-align: center" v-for="page in pages">
    <VuePDF :pdf="pdf" :page="page" />
</div>
