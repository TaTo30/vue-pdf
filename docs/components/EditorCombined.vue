<script setup>
import { ref, useTemplateRef } from "vue";
import {
  VuePDF,
  usePDF,
  PDFFreeTextAnnotation,
  PDFHighlightAnnotation,
  PDFInkAnnotation,
  PDFStampAnnotation,
} from "@tato30/vue-pdf";
import "pdfjs-dist/web/pdf_viewer.css";

const { pdf } = usePDF(
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
);

const editorTypes = [
  { value: 0, label: "None" },
  { value: 3, label: "FreeText" },
  { value: 9, label: "Highlight" },
  { value: 15, label: "Ink" },
  { value: 13, label: "Stamp" },
];
const editorType = ref(0);

const colorOptions = [
  "#2196F3",
  "#F44336",
  "#4CAF50",
  "#FFEB3B",
  "#FF9800",
  "#9C27B0",
];
const color = ref("#2196F3");
const fontSize = ref(20);
const thickness = ref(12);
const opacity = ref(1.0);

const stamp = useTemplateRef("stamp");

function addStamp() {
  stamp.value?.addStamp();
}

function onAltText(editor, callback) {
  const text = prompt("Enter alt text for the image:");
  callback(text);
}
</script>

<template>
  <div class="vue-pdf-container">
    <table>
      <tbody>
        <tr>
          <td>Editor</td>
          <td>
            <select v-model="editorType" class="select-example">
              <option
                v-for="et in editorTypes"
                :key="et.value"
                :value="et.value"
              >
                {{ et.label }}
              </option>
            </select>
          </td>
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
          <td>Font Size</td>
          <td>
            <input v-model.number="fontSize" type="range" min="8" max="72" />
            {{ fontSize }}px
          </td>
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
          <td colspan="2">
            <button
              v-if="editorType === 13"
              class="button-example"
              @click="addStamp"
            >
              Add Stamp
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
        :editor-type="editorType"
        fit-parent
      >
        <template #editors>
          <PDFFreeTextAnnotation :color="color" :fontSize="fontSize" />
          <PDFHighlightAnnotation :color="color" :thickness="thickness" />
          <PDFInkAnnotation
            :color="color"
            :thickness="thickness"
            :opacity="opacity"
          />
          <PDFStampAnnotation ref="stamp" @alt-text="onAltText" />
        </template>
      </VuePDF>
    </div>
  </div>
</template>
