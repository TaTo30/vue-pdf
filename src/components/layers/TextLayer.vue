<script setup lang="ts">
import * as PDFJS from 'pdfjs-dist'
import { onMounted, ref, watch } from 'vue'

import 'pdfjs-dist/web/pdf_viewer.css'

import type { PDFPageProxy, PageViewport } from 'pdfjs-dist'
import type { TextLayerRenderParameters } from 'pdfjs-dist/types/src/display/text_layer'

const props = defineProps<{
  page: PDFPageProxy | null
  viewport: PageViewport | null
}>()

const layer = ref<HTMLDivElement>()
const endContent = ref<HTMLDivElement>()

function render() {
  layer.value!.replaceChildren?.()

  const page = props.page
  const viewport = props.viewport

  const textStream = page?.streamTextContent({ includeMarkedContent: true, disableNormalization: true })
  const parameters: TextLayerRenderParameters = {
    textContentSource: textStream!,
    viewport: viewport!,
    container: layer.value!,
    isOffscreenCanvasSupported: true,
    textDivs: [],
    textDivProperties: new WeakMap(),
  }

  const task = PDFJS.renderTextLayer(parameters)
  task.promise.then(() => {
    const endOfContent = document.createElement('div')
    endOfContent.className = 'endOfContent'
    layer.value?.appendChild(endOfContent)
    endContent.value = endOfContent
  })
}

function onMouseDown() {
  if (!endContent.value)
    return
  endContent.value.classList.add('active')
}

function onMouseUp() {
  if (!endContent.value)
    return
  endContent.value.classList.remove('active')
}

watch(() => props.viewport, (_) => {
  if (props.page && props.viewport)
    render()
})

onMounted(() => {
  if (props.page && props.viewport)
    render()
})
</script>

<template>
  <div ref="layer" class="textLayer" style="display: block;" @mousedown="onMouseDown" @mouseup="onMouseUp" />
</template>

<style>
.textLayer {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.textLayer .endOfContent {
  display: block;
  position: absolute;
  left: 0px;
  top: 100%;
  right: 0px;
  bottom: 0px;
  z-index: -1;
  cursor: default;
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -moz-user-select: none;
}

.textLayer .endOfContent.active {
  top: 0px;
}
</style>
