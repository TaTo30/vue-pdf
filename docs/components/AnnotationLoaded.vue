<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import { withBase } from 'vitepress/client';

const { pdf } = usePDF(withBase('/example_014.pdf'))
function onLoaded(value) {
  console.log(value)
}
</script>

<template>
  <div class="vue-pdf-container">
    <VuePDF :pdf="pdf" annotation-layer @annotation-loaded="onLoaded" />
  </div>
</template>
