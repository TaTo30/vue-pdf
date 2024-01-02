<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import '@tato30/vue-pdf/style.css';
import { ref } from 'vue';

const text_layer = ref(false)
const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
</script>

<template>
  <div class="vue-pdf-container">
    <div>
      <button class="button-example" @click="text_layer = !text_layer">
        Change to <strong>{{ !text_layer }}</strong>
      </button>
    </div>
    <VuePDF :pdf="pdf" :text-layer="text_layer" />
  </div>
</template>
