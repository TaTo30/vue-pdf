<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import '@tato30/vue-pdf/style.css';
import { withBase } from 'vitepress/client';
import { ref } from 'vue';

const { pdf } = usePDF({
  url: withBase('/xfa.pdf'),
  enableXfa: true,
})
const eventValue = ref('Rendering pending')
function onLoaded() {
  eventValue.value = 'XFA loaded'
}
</script>

<template>
  <div class="language-json" data-ext="json">
    <pre class="language-json"><code>{{ eventValue }}</code></pre>
  </div>

  <div class="vue-pdf-container">
    <VuePDF :pdf="pdf" @xfa-loaded="onLoaded" />
  </div>
</template>
