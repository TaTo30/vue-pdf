<script setup lang="ts">
import { VuePDF, usePDF } from '../../src';

import pdf014 from '../pdf/lazy.pdf';

const { pdf, pages } = usePDF(pdf014)
</script>

<template>
  <div style="text-align: center;">
    <div v-for="page in pages" :key="page">
      <VuePDF :pdf="pdf" :page="page" text-layer>
        <div class="load">
          Loading page... {{ page }}
        </div>
      </VuePDF>
    </div>
  </div>
</template>

<style>

.load {
  width: 100px;
  height: 100px;
  background-color: lightblue;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

</style>
