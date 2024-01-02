<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf';

const { pdf, pages } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
</script>

<template>
  <div v-for="page in pages" :key="page" class="vue-pdf-container">
    <VuePDF :pdf="pdf" :page="page" />
  </div>
</template>
