<script setup lang="ts">
import { VuePDF, usePDF } from '../../src';
import pdflazy from '../pdf/lazy.pdf';

const { pdf, pages } = usePDF(pdflazy)
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
