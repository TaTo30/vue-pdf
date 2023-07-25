<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
</script>

<template>
  <div class="container">
    <div>
      <VuePDF :pdf="pdf" watermark-text="Sample" />
    </div>
  </div>
</template>
