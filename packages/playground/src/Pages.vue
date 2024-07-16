<script setup lang="ts">
import pdfdoc from '@samples/14.pdf';
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import { ref } from 'vue';

const { pdf } = usePDF(pdfdoc)
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
      <VuePDF :pdf="pdf" :page="page" text-layer watermark-text="confidencial" />
    </div>
  </div>
</template>

<style>

</style>
