<script setup lang="ts">
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import { ref } from 'vue';

const { pdf } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
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
    <VuePDF :page="1" :pdf="pdf" :text-layer="layer" :scale="scale" :rotation="rotation" @loaded="onLoaded" />
  </div>
</template>

<style>

</style>
