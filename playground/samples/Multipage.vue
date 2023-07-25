<script setup lang="ts">
import { VuePDF, usePDF } from '../../src';

const { pdf, pages } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
</script>

<template>
  <div style="text-align: center;">
    <div v-for="page in pages" :key="page">
      <VuePDF :pdf="pdf" :page="page" text-layer>
        <span>Loading page {{ page }}...</span>
      </VuePDF>
    </div>
  </div>
</template>

<style>

</style>
