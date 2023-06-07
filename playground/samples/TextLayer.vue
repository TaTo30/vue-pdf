<script setup lang="ts">
import { ref } from 'vue';
import { VuePDF, usePDF } from '../../src';

import pdflazy from '../pdf/lazy.pdf';

const { pdf } = usePDF(pdflazy)
const scale = ref(1)
const rotation = ref(0)
const layer = ref(true)

function onLoaded(value) {
  console.log(value)
}
</script>

<template>
  <div>
    <button @click="scale = scale - 0.25">
      - Scale
    </button>
    {{ scale }}
    <button @click="scale = scale + 0.25">
      + Scale
    </button>
    <button @click="rotation = rotation - 90">
      - Rotation
    </button>
    {{ rotation }}
    <button @click="rotation = rotation + 90">
      + Rotation
    </button>
    <button @click="layer = !layer">
      Layer {{ layer }}
    </button>
    <div style="text-align: center;">
      <VuePDF :pdf="pdf" :text-layer="layer" :scale="scale" :rotation="rotation" @loaded="onLoaded">
        <span>Loading</span>
      </VuePDF>
      <div>
        Texto por debajo
      </div>
    </div>
  </div>
</template>

<style>

</style>
