<script setup>
import { ref } from "vue";
import { VuePDF, usePDF, PDFFreeTextAnnotation } from "@tato30/vue-pdf";
import "pdfjs-dist/web/pdf_viewer.css";

const { pdf } = usePDF(
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
);

const colorOptions = ["#2196F3", "#F44336", "#4CAF50", "#FF9800", "#9C27B0"];
const color = ref("#2196F3");
const fontSize = ref(20);
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
          <td>Font Size</td>
          <td>
            <input v-model.number="fontSize" type="range" min="8" max="72" />
            {{ fontSize }}px
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
        :editor-type="3"
        fit-parent
      >
        <template #editors>
          <PDFFreeTextAnnotation :color="color" :fontSize="fontSize" />
        </template>
      </VuePDF>
    </div>
  </div>
</template>
