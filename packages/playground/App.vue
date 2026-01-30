<!-- eslint-disable unused-imports/no-unused-imports -->
<!-- Use this component to play with the main components -->
<script setup lang="ts">
import { ref } from "vue";
import pdf14 from "@samples/issue126.pdf";
import {
  VuePDF,
  usePDF,
  PDFFreeTextAnnotation,
  PDFHighlightAnnotation,
} from "@tato30/vue-pdf";

import "pdfjs-dist/web/pdf_viewer.css";
const { pdf, download } = usePDF(pdf14);
const colorOptions = ["blue", "red", "green", "yellow", "purple", "orange"];
const color = ref<string>(colorOptions[0]);

const fontSize = ref<number>(20);
const thickness = ref<number>(20);

const toggle = ref(false);
type EditorType = 0 | 3 | 9;
const editorType = ref<EditorType>(3);

const rotation = ref<number>(0);
</script>

<template>
  <button @click="download()">descargar</button>
  <button @click="toggle = !toggle">toggle</button>

  <button @click="rotation = (rotation + 270) % 360">-90</button>
  <button @click="rotation = (rotation + 90) % 360">+90</button>

  <label>
    Editor:
    <select v-model="editorType">
      <option :value="3">FREETEXT</option>
      <option :value="9">HIGHLIGHT</option>
      <option :value="0">NONE</option>
    </select>
  </label>

  <label>
    Color:
    <select v-model="color">
      <option v-for="c in colorOptions" :key="c" :value="c">{{ c }}</option>
    </select>
  </label>

  <label>
    Font size:
    <input type="range" min="8" max="72" v-model.number="fontSize" />
    {{ fontSize }}
  </label>

  <label>
    Thickness:
    <input type="range" min="1" max="40" v-model.number="thickness" />
    {{ thickness }}
  </label>
  {{ editorType }}
  <div style="display: flex; align-items: center">
    <VuePDF
      :pdf="pdf"
      :rotation="rotation"
      annotation-layer
      text-layer
      :editor-layer="toggle"
      :editor-type="editorType"
    >
      <template #editors>
        <PDFFreeTextAnnotation :color="color" :fontSize="fontSize" />
        <PDFHighlightAnnotation :color="color" :thickness="thickness" />
      </template>
    </VuePDF>
  </div>
</template>
