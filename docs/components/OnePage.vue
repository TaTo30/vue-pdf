<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import { ref } from 'vue';

const page = ref(1)
const { pdf, pages } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
</script>

<template>
  <div class="vue-pdf-container">
    <div>
      <button class="button-example" @click="page = page > 1 ? page - 1 : page">
        PREV
      </button>
      <span>{{ page }}/{{ pages }}</span>
      <button class="button-example" @click="page = page < pages ? page + 1 : page">
        NEXT
      </button>
    </div>
    <div style="width: 500px">
      <VuePDF :pdf="pdf" :page="page" fit-parent />
    </div>
  </div>
</template>
