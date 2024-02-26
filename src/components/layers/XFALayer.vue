<script setup lang="ts">
import * as PDFJS from 'pdfjs-dist'
import { onMounted, ref, toRaw, watch } from 'vue'

import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist'
import type { XfaLayerParameters } from 'pdfjs-dist/types/src/display/xfa_layer'

import { SimpleLinkService } from '../utils/link_service'

const props = defineProps<{
  page?: PDFPageProxy
  document?: PDFDocumentProxy
  viewport?: PageViewport
}>()

const emit = defineEmits<{
  (event: 'xfaLoaded'): void
}>()

const layer = ref<HTMLDivElement>()

async function render() {
  layer.value!.replaceChildren?.()

  const pdf = toRaw(props.document)
  const page = props.page
  const viewport = props.viewport

  if (pdf!.isPureXfa) {
    const xfaHTML = await page!.getXfa()
    const parameters: XfaLayerParameters = {
      div: layer.value!,
      viewport: viewport!.clone({ dontFlip: true }),
      linkService: new SimpleLinkService(),
      annotationStorage: pdf?.annotationStorage,
      xfaHtml: xfaHTML!,
    }
    PDFJS.XfaLayer.render(parameters)
    emit('xfaLoaded')
  }
}

watch(() => props.viewport, (_) => {
  if (props.page && props.viewport && layer.value)
    render()
})

onMounted(() => {
  if (props.page && props.viewport && layer.value)
    render()
})
</script>

<template>
  <div ref="layer" style="display: block;" />
</template>

<style>
/* Make this layer over other layers */
.xfaLayer {
  z-index: 5;
}
</style>
