<script setup lang="ts">
import { ref } from 'vue'
import { VuePDF, usePDF } from '../src'
import example_014 from './pdf/example_014.pdf'

const { pdf, pages, info } = usePDF(example_014)

const viewer = ref<InstanceType<typeof VuePDF>>()
const parentWidth = ref(600)

function updateParentWidth() {
  parentWidth.value += 100
  viewer.value?.reload()
}
</script>

<template>
  <button @click="updateParentWidth">
    100 mas
  </button>
  <div :style="`text-align: center; border: 1px red solid; width: ${parentWidth}px;`">
    <VuePDF ref="viewer" :pdf="pdf" :page="1" text-layer annotation-layer fit-parent />
  </div>
</template>

<style>

</style>
