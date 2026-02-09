<script setup>
import { ref } from "vue";
import { VuePDF, usePDF, PDFHighlightAnnotation } from "@tato30/vue-pdf";
import "pdfjs-dist/web/pdf_viewer.css";

const { pdf, download } = usePDF(
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
);

const colorOptions = ["#FFEB3B", "#8BC34A", "#FFCBE6", "#F44336", "#2196F3"];
const color = ref("#FFEB3B");
const thickness = ref(12);

function onColorChanged(event) {
  console.log("[Highlight] colorChanged:", event);
}
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
        </tr>
        <tr>
          <td>Thickness</td>
          <td>
            <input v-model.number="thickness" type="range" min="1" max="40" />
            {{ thickness }}
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <button class="button-example" @click="download()">
              Download PDF
            </button>
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
          <PDFHighlightAnnotation
            :color="color"
            :thickness="thickness"
            @color-changed="onColorChanged"
          />
        </template>
      </VuePDF>
    </div>
  </div>
</template>
