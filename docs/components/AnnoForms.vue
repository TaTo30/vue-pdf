<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import { withBase } from 'vitepress/client';
import { ref } from 'vue';

const { pdf } = usePDF(withBase('/example_014.pdf'))
const eventValue = ref({})
function onAnnotation(value) {
  console.log(value)
  eventValue.value = value
}
</script>

<template>
  <div class="language-json" data-ext="json">
    <pre class="language-json"><code>{{ eventValue }}</code></pre>
  </div>

  <div class="vue-pdf-container">
    <VuePDF :pdf="pdf" annotation-layer @annotation="onAnnotation" />
  </div>
</template>
