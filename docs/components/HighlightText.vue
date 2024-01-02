<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import '@tato30/vue-pdf/style.css';
import { ref } from 'vue';

const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
const highlightText = ref('javascript')
const highlightOptions = ref({
  completeWords: false,
  ignoreCase: true,
})
</script>

<template>
  <div class="vue-pdf-container">
    <table>
      <tr>
        <td colspan="2">
          Text
        </td>
        <td colspan="2">
          <input v-model="highlightText" class="input-example">
        </td>
      </tr>
      <tr>
        <td>Complete words</td>
        <td><input v-model="highlightOptions.completeWords" type="checkbox" class="checkbox-example"></td>
        <td>Ignore case</td>
        <td><input v-model="highlightOptions.ignoreCase" type="checkbox" class="checkbox-example"></td>
      </tr>
    </table>

    <VuePDF :scale="1.1" :pdf="pdf" text-layer :highlight-text="highlightText" :highlight-options="highlightOptions" />
  </div>
</template>
