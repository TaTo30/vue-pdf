<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import { ref } from 'vue';

const rotation = ref(0)
const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
</script>

<template>
  <div class="vue-pdf-container">
    <div>
      <button class="button-example" @click="rotation = rotation - 90">
        - 90°
      </button>
      <span>{{ rotation }}°</span>
      <button class="button-example" @click="rotation = rotation + 90">
        + 90°
      </button>
    </div>
    <VuePDF :pdf="pdf" :rotation="rotation" />
  </div>
</template>
