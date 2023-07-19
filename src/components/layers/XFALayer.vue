<script setup lang="ts">
import * as PDFJS from 'pdfjs-dist'
import { onMounted, ref, toRaw, watch } from 'vue'

import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist'
import type { XfaLayerParameters } from 'pdfjs-dist/types/src/display/xfa_layer'

import { SimpleLinkService } from '../utils/link_service'

const props = defineProps<{
  page: PDFPageProxy
  document: PDFDocumentProxy
  viewport: PageViewport
}>()

// if (pdfPage.isPureXfa) {
//       if (!this.xfaLayer) {
//         const { annotationStorage, linkService } = this.#layerProperties();

//         this.xfaLayer = new XfaLayerBuilder({
//           pageDiv: div,
//           pdfPage,
//           annotationStorage,
//           linkService,
//         });
//       } else if (this.xfaLayer.div) {
//         // The xfa layer needs to stay on top.
//         div.append(this.xfaLayer.div);
//       }
//       this.#renderXfaLayer();
//     }

const layer = ref<HTMLDivElement>()

function render() {
  layer.value!.replaceChildren?.()
  const pdf = toRaw(props.document)

  props.page?.getXfa().then((xfahtml) => {
    const parameters: XfaLayerParameters = {
      div: layer.value as HTMLDivElement,
      viewport: props.viewport!.clone({ dontFlip: true }),
      linkService: new SimpleLinkService(),
      annotationStorage: pdf?.annotationStorage,
      xfaHtml: xfahtml!,
    }
    PDFJS.XfaLayer.render(parameters)
  })
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
  <div ref="layer" />
</template>
