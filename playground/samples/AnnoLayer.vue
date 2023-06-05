<script setup lang="ts">
import { ref } from 'vue';
import { VuePDF, usePDF } from '../../src';

import pdf014 from '../pdf/example_014.pdf';

const { pdf } = usePDF(pdf014)
const scale = ref(1)
const rotation = ref(0)

function onAnnotation(value) {
  console.log(value)
}
</script>

<template>
  <div>
    <button @click="scale = scale + 0.25">
      + Scale
    </button>
    <button @click="scale = scale - 0.25">
      - Scale
    </button>
    <button @click="rotation = rotation + 90">
      + Rotation
    </button>
    <button @click="rotation = rotation - 90">
      - Rotation
    </button>
    <div style="text-align: center;">
      <VuePDF :pdf="pdf" annotation-layer :scale="scale" :rotation="rotation" @annotation="onAnnotation" />
    </div>
  </div>
</template>

<style>

</style>
