<!-- eslint-disable unused-imports/no-unused-imports -->
<!-- eslint-disable unused-imports/no-unused-imports -->
<!-- Use this component to play with the main components -->
<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import pdf14 from "@samples/issue133.pdf";
import {
  VuePDF,
  usePDF,
  PDFFreeTextAnnotation,
  PDFHighlightAnnotation,
  PDFInkAnnotation,
  PDFCommentAnnotation,
  PDFStampAnnotation,
} from "@tato30/vue-pdf";

import "pdfjs-dist/web/pdf_viewer.css";
import { resourceLimits } from "worker_threads";
const { pdf, download } = usePDF(pdf14);
const colorOptions = ["#2196F3", "red", "green", "yellow", "purple", "orange"];
const color = ref<string>(colorOptions[0]);

const fontSize = ref<number>(20);
const thickness = ref<number>(20);
const opacity = ref<number>(1.0);

const toggle = ref(true);
type EditorType = 0 | 3 | 9 | 13 | 101;
const editorType = ref<EditorType>(101);

const rotation = ref<number>(0);
const scale = ref(1.0);

const stamp = useTemplateRef("stamp01");

function addImage() {
  stamp.value?.addStamp();
}

function addCommentText(cb: Function) {
  const data = prompt("Enter comment text:");
  cb(data);
}

function zoomIn(value:number):number {
  let result:number = value;
  result = result < 10 ? result + 0.1 : result 
  console.log('zoom:' + result)
  return result;
}

function zoomOut(value:number):number {
  let result:number = value;
  result = result > 0.2 ? result - 0.1 : result 
  console.log('zoom:' + result)
  return result;
}

function addAltText(cb: Function) {
  const data = prompt("Enter alt text:");
  cb(data);
}



</script>

<template>
  <button @click="download()">descargar</button>
  <button @click="addImage()">agregarImagen</button>
  <button @click="toggle = !toggle">toggle</button>

  <button @click="rotation = (rotation + 270) % 360">-90</button>
  <button @click="rotation = (rotation + 90) % 360">+90</button>
 <button @click="scale=zoomOut(scale)" > zoom - </button>
 <button @click="scale=zoomIn(scale)" > zoom+ </button>
 
  <label>
    Editor:
    <select v-model="editorType">
      <option :value="3">FREETEXT</option>
      <option :value="9">HIGHLIGHT</option>
      <option :value="15">INK</option>
      <option :value="13">STAMP</option>
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
  <label>
    Opacity:
    <input type="range" min="0" max="1" step="0.01" v-model.number="opacity" />
    {{ opacity }}
  </label>
  {{ editorType }}
  <div style="position: fixed;" >
    <VuePDF
      :pdf="pdf"
      :scale="scale"
      :style="{ overflow : 'visible' }"
      :rotation="rotation"
      annotation-layer
      text-layer
      :editor-layer="toggle"
      :editor-type="editorType"

    >
      <template #editors>
        <PDFFreeTextAnnotation :color="color" :fontSize="fontSize" />
        <PDFHighlightAnnotation :color="color" :thickness="thickness" />
        <PDFInkAnnotation
          :color="color"
          :thickness="thickness"
          :opacity="opacity"
        />
        <!-- <PDFCommentAnnotation @add-comment="addCommentText" /> -->
        <PDFStampAnnotation ref="stamp01" @alt-text="addAltText" />
      </template>
    </VuePDF>
  </div>
</template>
