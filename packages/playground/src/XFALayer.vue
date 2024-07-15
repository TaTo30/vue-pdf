<!-- eslint-disable no-console -->
<script setup lang="ts">
import type { DocumentInitParameters } from 'pdfjs-dist/types/src/display/api';
import { ref } from 'vue';

import { VuePDF, usePDF } from '@tato30/vue-pdf';

import pdf014 from 'samples/example_014.pdf';

const docinit: DocumentInitParameters = {
  url: pdf014,
  enableXfa: true,
}

const { pdf } = usePDF(docinit)
const scale = ref(1)
const rotation = ref(0)

function getAnnotations() {
  pdf.value?.promise.then((doc) => {
    console.log(doc.annotationStorage)
    console.log(doc.annotationStorage.print.getAll())
    console.log(doc.annotationStorage.getAll())
  })
}
</script>

<template>
  <div>
    <button @click="scale = scale - 0.25">
      - Scale
    </button>
    <button @click="scale = scale + 0.25">
      + Scale
    </button>
    <button @click="rotation = rotation - 90">
      - Rotation
    </button>
    <button @click="rotation = rotation + 90">
      + Rotation
    </button>
    <button @click="getAnnotations">
      get annotations
    </button>
    <div style="text-align: center;">
      <VuePDF
        :pdf="pdf"
        :scale="scale"
        :rotation="rotation"
        annotation-layer
        text-layer
        image-resources-path="https://unpkg.com/pdfjs-dist@3.7.107/web/images/"
      />
    </div>
  </div>
</template>

<style>

</style>
