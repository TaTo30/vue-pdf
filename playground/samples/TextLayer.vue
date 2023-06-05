<script setup lang="ts">
import { ref } from 'vue';
import { VuePDF, usePDF } from '../../src';

const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
const scale = ref(1)
const rotation = ref(0)
const layer = ref(false)
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
    <button @click="layer = !layer">
      Layer {{ layer }}
    </button>
    <div style="text-align: center;">
      <VuePDF :pdf="pdf" :text-layer="layer" :scale="scale" :rotation="rotation" />
    </div>
  </div>
</template>

<style>

</style>
