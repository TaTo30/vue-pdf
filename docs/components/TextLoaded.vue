<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf';

const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
function onLoaded(value) {
  console.log(value)
}
</script>

<template>
  <div class="vue-pdf-container">
    <VuePDF :pdf="pdf" text-layer @text-loaded="onLoaded" />
  </div>
</template>
