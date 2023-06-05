<script setup lang="ts">
import { ref } from 'vue';
import { VuePDF, usePDF } from '../../src';

const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
const page = ref(1)
</script>

<template>
  <div>
    <button @click="page = page + 1">
      + Page
    </button>
    <button @click="page = page - 1">
      - Page
    </button>
    <div style="text-align: center;">
      <VuePDF :pdf="pdf" :page="page" text-layer />
    </div>
  </div>
</template>

<style>

</style>
