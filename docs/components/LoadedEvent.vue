<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import { ref } from 'vue';

const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
const eventValue = ref({})
function onLoaded(value) {
  console.log(value)
  eventValue.value = value
}
</script>

<template>
  <div class="language-json" data-ext="json">
    <pre class="language-json"><code>{{ eventValue }}</code></pre>
  </div>

  <div class="vue-pdf-container">
    <VuePDF :pdf="pdf" @loaded="onLoaded" />
  </div>
</template>
