<script setup>
import { ref } from "vue";
import { VuePDF, usePDF, PDFInkAnnotation } from "@tato30/vue-pdf";
import "pdfjs-dist/web/pdf_viewer.css";

const { pdf } = usePDF(
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
);

const colorOptions = ["#F44336", "#2196F3", "#4CAF50", "#FF9800", "#9C27B0"];
const color = ref("#F44336");
const thickness = ref(5);
const opacity = ref(1.0);
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
          <td>Opacity</td>
          <td>
            <input
              v-model.number="opacity"
              type="range"
              min="0"
              max="1"
              step="0.05"
            />
            {{ opacity }}
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
        :editor-type="15"
        fit-parent
      >
        <template #editors>
          <PDFInkAnnotation
            :color="color"
            :thickness="thickness"
            :opacity="opacity"
          />
        </template>
      </VuePDF>
    </div>
  </div>
</template>
