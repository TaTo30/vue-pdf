<script setup lang="ts">
import { VuePDF } from '@tato30/vue-pdf';
import * as PDFJS from 'pdfjs-dist';
import { ref } from 'vue';

const loadingTask = PDFJS.getDocument('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')

const pdf = ref()
pdf.value = loadingTask
</script>

<template>
  <div>
    <div style="text-align: center;">
      <VuePDF :pdf="pdf" />
    </div>
  </div>
</template>

<style>

</style>
