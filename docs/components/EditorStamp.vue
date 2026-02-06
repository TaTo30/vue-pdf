<script setup>
import { useTemplateRef } from "vue";
import { VuePDF, usePDF, PDFStampAnnotation } from "@tato30/vue-pdf";
import "pdfjs-dist/web/pdf_viewer.css";

const { pdf } = usePDF(
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
);

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
    <div>
      <button class="button-example" @click="addStamp">Add Stamp</button>
    </div>
    <div style="width: 500px">
      <VuePDF
        :pdf="pdf"
        text-layer
        annotation-layer
        editor-layer
        :editor-type="13"
        fit-parent
      >
        <template #editors>
          <PDFStampAnnotation ref="stamp" @alt-text="onAltText" />
        </template>
      </VuePDF>
    </div>
  </div>
</template>
