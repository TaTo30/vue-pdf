<script setup lang="ts">
import { ref } from 'vue';
import { VuePDF, usePDF } from '../../src';

import pdf014 from '../pdf/example_014.pdf';

const { pdf } = usePDF(pdf014)
const scale = ref(1)
const rotation = ref(0)

const vuePDFRef = ref(null)

function reloadPage() {
  vuePDFRef.value.reload()
}

const filters = ref(['Widget', 'Widget.Tx', 'Widget.Btn', 'Widget.Ch'])
const selectedFilter = ref(['Widget'])

function onAnnotation(value) {
  console.log(value)
}

function annotationMap(annotation) {
  if (annotation.id === '7R')
    annotation.fieldValue = 'Modified value'
  return annotation
}

function getAnnotations() {
  const st = vuePDFRef.value.getAnnotationStorage()
  console.log(st.getAll())
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
    <button @click="reloadPage">
      reload
    </button>
    <select v-model="selectedFilter[0]" class="select-example" @change="reloadPage">
      <option v-for="flt in filters" :key="flt" :value="flt">
        {{ flt }}
      </option>
    </select>
    <div style="text-align: center;">
      <VuePDF
        ref="vuePDFRef" :pdf="pdf" text-layer annotation-layer
        :scale="scale"
        :rotation="rotation"
        :annotations-filter="selectedFilter"
        :annotations-map="annotationMap"
        @annotation="onAnnotation"
      />
    </div>
  </div>
</template>

<style>

</style>
