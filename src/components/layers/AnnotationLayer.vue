<script setup lang="ts">
import * as PDFJS from 'pdfjs-dist'
import { onMounted, ref, toRaw, watch } from 'vue'

import 'pdfjs-dist/web/pdf_viewer.css'

import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist'
import type { AnnotationLayerParameters } from 'pdfjs-dist/types/src/display/annotation_layer'

import { EVENTS_TO_HANDLER, annotationEventsHandler } from '../utils/annotations'
import { SimpleLinkService } from '../utils/link_service'

import type { AnnotationEventPayload } from '../types'

const props = defineProps<{
  page: PDFPageProxy | null
  viewport: PageViewport | null
  document: PDFDocumentProxy | null
}>()

const emit = defineEmits<{
  (event: 'annotation', payload: AnnotationEventPayload): void
}>()

const AnnotationlayerREF = ref<HTMLDivElement>()
const Annotations = ref<Object[]>()

function annotationsEvents(evt: Event) {
  const value = annotationEventsHandler(evt, props.document!, Annotations.value!)
  Promise.resolve(value).then((data) => {
    if (data)
      emit('annotation', data)
  })
}

async function getFieldObjects() {
  const fieldObjects = await toRaw(props.document)?.getFieldObjects()
  return fieldObjects
}

async function getHasJSActions() {
  const hasJSActions = await toRaw(props.document)?.hasJSActions()
  return hasJSActions
}

function render() {
  AnnotationlayerREF.value!.replaceChildren?.()

  const page = props.page
  const viewport = props.viewport

  page?.getAnnotations().then(async (annotations) => {
    Annotations.value = annotations

    // Canvas map for push button widget
    const canvasMap = new Map<string, HTMLCanvasElement>([])
    for (const anno of annotations) {
      if (anno.subtype === 'Widget' && anno.fieldType === 'Btn' && anno.pushButton) {
        const canvasWidth = anno.rect[2] - anno.rect[0]
        const canvasHeight = anno.rect[3] - anno.rect[1]
        const subCanvas = document.createElement('canvas')
        subCanvas.setAttribute('width', (canvasWidth * viewport!.scale).toString())
        subCanvas.setAttribute('height', (canvasHeight * viewport!.scale).toString())
        canvasMap.set(anno.id, subCanvas)
      }
    }

    const parameters: AnnotationLayerParameters = {
      annotations,
      viewport: viewport?.clone({ dontFlip: true }) as PageViewport,
      linkService: new SimpleLinkService(),
      annotationCanvasMap: canvasMap,
      div: AnnotationlayerREF.value!,
      renderForms: true,
      page,
      enableScripting: true,
      hasJSActions: await getHasJSActions(),
      fieldObjects: await getFieldObjects(),
      downloadManager: null,
    }
    PDFJS.AnnotationLayer.render(parameters)

    for (const evtHandler of EVENTS_TO_HANDLER)
      AnnotationlayerREF.value!.addEventListener(evtHandler, annotationsEvents)
  })
}

watch(() => props.page, (page, _) => {
  if (page && props.viewport)
    render()
})

onMounted(() => {
  if (props.page && props.viewport)
    render()
})
</script>

<template>
  <div ref="AnnotationlayerREF" class="annotationLayer" style="display: block;" />
</template>

<style>
.annotationLayer {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

/* Make annotation sections available over text layer */
.annotationLayer section {
  z-index: 1 !important;
}
</style>
