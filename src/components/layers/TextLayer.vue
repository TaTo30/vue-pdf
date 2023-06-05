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

const TextlayerREF = ref<HTMLDivElement>()
const EndOfContent = ref<HTMLDivElement>()

function render() {
  TextlayerREF.value!.replaceChildren?.()

  const page = props.page
  const viewport = props.viewport

  const textStream = page?.streamTextContent({ includeMarkedContent: true, disableNormalization: true })
  const parameters: TextLayerRenderParameters = {
    textContentSource: textStream as ReadableStream,
    viewport: viewport as PageViewport,
    container: TextlayerREF.value as HTMLElement,
    isOffscreenCanvasSupported: true,
    textDivs: [],
    textDivProperties: new WeakMap(),
  }

  const task = PDFJS.renderTextLayer(parameters)
  task.promise.then(() => {
    const endOfContent = document.createElement('div')
    endOfContent.className = 'endOfContent'
    TextlayerREF.value?.appendChild(endOfContent)
    EndOfContent.value = endOfContent
  })
}

function onMouseDown() {
  if (!EndOfContent.value)
    return

  EndOfContent.value.classList.add('active')
}

function onMouseUp() {
  if (!EndOfContent.value)
    return

  EndOfContent.value.classList.remove('active')
}

watch(() => [props.page, props.viewport], ([page, viewport]) => {
  if (page && viewport)
    render()
})

onMounted(() => {
  if (props.page && props.viewport)
    render()
})
</script>

<template>
  <div ref="TextlayerREF" class="textLayer" style="display: block;" @mousedown="onMouseDown" @mouseup="onMouseUp" />
</template>

<style>
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
