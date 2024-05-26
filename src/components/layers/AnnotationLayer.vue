<script setup lang="ts">
import * as PDFJS from 'pdfjs-dist'
import { onMounted, ref, toRaw, watch } from 'vue'

import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist'
import type { AnnotationLayerParameters } from 'pdfjs-dist/types/src/display/annotation_layer'
import type { IDownloadManager } from 'pdfjs-dist/types/web/interfaces'

import { EVENTS_TO_HANDLER, annotationEventsHandler } from '../utils/annotations'
import { SimpleLinkService } from '../utils/link_service'

import type { AnnotationEventPayload } from '../types'

const props = defineProps<{
  page?: PDFPageProxy
  viewport?: PageViewport
  document?: PDFDocumentProxy
  annotationsFilter?: string[]
  annotationsMap?: object
  imageResourcesPath?: string
  hideForms?: boolean
  enableScripting?: boolean
  intent: string
}>()

const emit = defineEmits<{
  (event: 'annotation', payload: AnnotationEventPayload): void
  (event: 'annotationLoaded', payload: any[]): void
}>()

const layer = ref<HTMLDivElement>()
const annotations = ref<any[]>()

function annotationsEvents(evt: Event) {
  const value = annotationEventsHandler(evt, props.document!, annotations.value!)
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

async function getAnnotations() {
  const page = props.page

  let annotations = await page?.getAnnotations({ intent: props.intent })
  if (props.annotationsFilter) {
    const filters = props.annotationsFilter
    annotations = annotations!.filter((value) => {
      const subType = value.subtype
      const fieldType = value.fieldType ? `${subType}.${value.fieldType}` : null
      return filters?.includes(subType) || (fieldType !== null && filters?.includes(fieldType))
    })
  }

  return annotations
}

async function render() {
  layer.value!.replaceChildren?.()
  for (const evtHandler of EVENTS_TO_HANDLER)
    layer.value!.removeEventListener(evtHandler, annotationsEvents)

  const pdf = toRaw(props.document)
  const page = props.page
  const viewport = props.viewport

  annotations.value = await getAnnotations()

  // Canvas map for push button widget
  const canvasMap = new Map<string, HTMLCanvasElement>([])
  for (const anno of annotations.value!) {
    if (anno.subtype === 'Widget' && anno.fieldType === 'Btn' && anno.pushButton) {
      const canvasWidth = anno.rect[2] - anno.rect[0]
      const canvasHeight = anno.rect[3] - anno.rect[1]
      const subCanvas = document.createElement('canvas')
      subCanvas.setAttribute('width', (canvasWidth * viewport!.scale).toString())
      subCanvas.setAttribute('height', (canvasHeight * viewport!.scale).toString())
      canvasMap.set(anno.id, subCanvas)
    }
  }
  const annotationStorage = pdf!.annotationStorage
  if (props.annotationsMap) {
    for (const [key, value] of Object.entries(props.annotationsMap))
      annotationStorage.setValue(key, value)
  }

  const layerParameters = {
    accessibilityManager: undefined,
    annotationCanvasMap: canvasMap,
    div: layer.value!,
    page: page!,
    viewport: viewport!.clone({ dontFlip: true }),
    annotationEditorUIManager: null,
  }

  const renderParameters: AnnotationLayerParameters = {
    annotations: annotations.value!,
    viewport: viewport!.clone({ dontFlip: true }),
    linkService: new SimpleLinkService(),
    annotationCanvasMap: canvasMap,
    div: layer.value!,
    annotationStorage,
    renderForms: !props.hideForms,
    page: page!,
    enableScripting: false,
    hasJSActions: await getHasJSActions(),
    fieldObjects: await getFieldObjects(),
    downloadManager: null as unknown as IDownloadManager,
    imageResourcesPath: props.imageResourcesPath,
  }
  const task = new PDFJS.AnnotationLayer(layerParameters).render(renderParameters)
  task.then(async () => {
    emit('annotationLoaded', (await getAnnotations())!)
  })

  for (const evtHandler of EVENTS_TO_HANDLER)
    layer.value!.addEventListener(evtHandler, annotationsEvents)
}

watch(() => props.viewport, () => {
  if (props.page && props.viewport && layer.value)
    render()
})

onMounted(() => {
  if (props.page && props.viewport && layer.value)
    render()
})
</script>

<template>
  <div ref="layer" class="annotationLayer" style="display: block;" />
</template>

<style>
.annotationLayer {
  right: 0;
  bottom: 0;
}

/* Make annotation sections available over text layer */
.annotationLayer section {
  z-index: 1 !important;
}
</style>
