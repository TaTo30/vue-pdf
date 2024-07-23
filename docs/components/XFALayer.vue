<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import '@tato30/vue-pdf/style.css';
import { withBase } from 'vitepress/client';

const { pdf } = usePDF({
  url: withBase('/xfa.pdf'),
  enableXfa: true,
})
</script>

<template>
  <div class="vue-pdf-container">
    <VuePDF :pdf="pdf" />
  </div>
</template>
