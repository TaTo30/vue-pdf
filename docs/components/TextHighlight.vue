<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import '@tato30/vue-pdf/style.css';
import { ref } from 'vue';

const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
const highlightText = ref('Trace-based')
const highlightOptions = ref({
  completeWords: false,
  ignoreCase: true,
})

const eventValue = ref({})
function onHighlight(value) {
  console.log(value)
  eventValue.value = value
}
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
    </table>

    <VuePDF :scale="1.1" :pdf="pdf" text-layer :highlight-text="highlightText" :highlight-options="highlightOptions" @highlight="onHighlight" />
  </div>
</template>
