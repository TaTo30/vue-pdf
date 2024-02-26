<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import { ref } from 'vue'
import { withBase } from 'vitepress/client'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF({
  url: withBase('/example_xfa.pdf'),
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
