<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import { ref } from 'vue'

const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')

const pdfRef = ref(null)
const watermarkText = ref('sample')
const watermarkOptions = ref({
  columns: 4,
  rows: 4,
  color: 'rgba(211, 210, 211, 0.4)',
  rotation: 45,
  fontSize: 18,
})

function reload() {
  pdfRef.value.reload()
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
          <input v-model="watermarkText" class="input-example">
        </td>
      </tr>
      <tr>
        <td colspan="2">
          Color
        </td>
        <td colspan="2">
          <input v-model="watermarkOptions.color" class="input-example">
        </td>
      </tr>
      <tr>
        <td>Columns</td>
        <td><input v-model="watermarkOptions.columns" class="input-example"></td>
        <td>Rows</td>
        <td><input v-model="watermarkOptions.rows" class="input-example"></td>
      </tr>
      <tr>
        <td>Rotation</td>
        <td><input v-model="watermarkOptions.rotation" class="input-example"></td>
        <td>FontSize</td>
        <td><input v-model="watermarkOptions.fontSize" class="input-example"></td>
      </tr>
    </table>

    <div>
      <button class="button-example" @click="reload">
        Reload
      </button>
    </div>
    <VuePDF ref="pdfRef" :pdf="pdf" :watermark-text="watermarkText" :watermark-options="watermarkOptions" />
  </div>
</template>
