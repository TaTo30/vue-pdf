<script setup>
import { ref } from "vue";
import { VuePDF, usePDF, PDFHighlightAnnotation } from "@tato30/vue-pdf";
import "pdfjs-dist/web/pdf_viewer.css";

const { pdf } = usePDF(
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
);

const colorOptions = ["#FFEB3B", "#8BC34A", "#FFCBE6", "#F44336", "#2196F3"];
const color = ref("#FFEB3B");
const thickness = ref(12);
</script>

<template>
  <div class="vue-pdf-container">
    <table>
      <tbody>
        <tr>
          <td>Color</td>
          <td>
            <select v-model="color" class="select-example">
              <option v-for="c in colorOptions" :key="c" :value="c">
                {{ c }}
              </option>
            </select>
          </td>
          <td>Thickness</td>
          <td>
            <input v-model.number="thickness" type="range" min="1" max="40" />
            {{ thickness }}
          </td>
        </tr>
      </tbody>
    </table>
    <div style="width: 500px">
      <VuePDF
        :pdf="pdf"
        text-layer
        annotation-layer
        editor-layer
        :editor-type="9"
        fit-parent
      >
        <template #editors>
          <PDFHighlightAnnotation :color="color" :thickness="thickness" />
        </template>
      </VuePDF>
    </div>
  </div>
</template>
