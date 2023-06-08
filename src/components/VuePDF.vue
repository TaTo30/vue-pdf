<!-- eslint-disable no-case-declarations -->
// import { SimpleLinkService } from 'pdfjs-dist/web/pdf_viewer'
<script setup lang="ts">
import * as PDFJS from 'pdfjs-dist'
import { onMounted, ref, toRaw, watch } from 'vue'

import type { PDFDocumentLoadingTask, PDFDocumentProxy, PDFPageProxy, PageViewport, RenderTask } from 'pdfjs-dist'
import type { GetViewportParameters, RenderParameters } from 'pdfjs-dist/types/src/display/api'
import type { AnnotationEventPayload, LoadedEventPayload } from './types'

import AnnotationLayer from './layers/AnnotationLayer.vue'
import TextLayer from './layers/TextLayer.vue'

const props = withDefaults(defineProps<{
  pdf?: PDFDocumentLoadingTask
  page?: number
  scale?: number
  rotation?: number
  fitParent?: boolean
  annotationsFilter?: string[]
  textLayer?: boolean
  annotationLayer?: boolean
}>(), {
  page: 1,
  scale: 1,
})

const emit = defineEmits<{
  (event: 'annotation', payload: AnnotationEventPayload): void
  (event: 'loaded', payload: LoadedEventPayload): void
}>()

// Template Refs
const container = ref<HTMLSpanElement>()
const loadingLayer = ref<HTMLSpanElement>()
const loading = ref(false)
let renderTask: RenderTask

// PDF Refs
const DocumentProxy = ref<PDFDocumentProxy | null>(null)
const PageProxy = ref<PDFPageProxy | null>(null)
const InternalViewport = ref<PageViewport | null>(null)

function emitLoaded(data: LoadedEventPayload) {
  emit('loaded', data)
}

function emitAnnotation(data: AnnotationEventPayload) {
  emit('annotation', data)
}

function computeRotation(rotation: number): number {
  if (!(typeof props.rotation === 'number' && props.rotation % 90 === 0))
    return 0
  const factor = rotation / 90
  if (factor > 4)
    return computeRotation(rotation - 360)
  else if (factor < 0)
    return computeRotation(rotation + 360)
  return rotation
}

function computeScale(page: PDFPageProxy): number {
  let fscale = props.scale
  if (props.fitParent) {
    const parentWidth: number = (container.value!.parentNode! as HTMLElement).clientWidth
    const scale1Width = page.getViewport({ scale: 1 }).width
    fscale = parentWidth / scale1Width
  }
  return fscale
}

function getCurrentCanvas(): HTMLCanvasElement | null {
  let oldCanvas = null
  container.value?.childNodes.forEach((el) => {
    if ((el as HTMLElement).tagName === 'CANVAS')
      oldCanvas = el
  })
  return oldCanvas
}

function setupCanvas(viewport: PageViewport): HTMLCanvasElement {
  let canvas
  const currentCanvas = getCurrentCanvas()!
  if (currentCanvas && currentCanvas?.getAttribute('role') === 'main') {
    canvas = currentCanvas
  }
  else {
    canvas = document.createElement('canvas')
    canvas.style.display = 'block'
    canvas.setAttribute('dir', 'ltr')
  }
  canvas.width = viewport.width
  canvas.height = viewport.height

  canvas.style.width = `${viewport.width}px`
  canvas.style.height = `${viewport.height}px`

  // --scale-factor property
  container.value?.style.setProperty('--scale-factor', `${viewport.scale}`)
  // Also setting dimension properties for load layer
  loadingLayer.value!.style.width = `${viewport.width}px`
  loadingLayer.value!.style.height = `${viewport.height}px`
  loading.value = true
  return canvas
}

function cancelRender() {
  if (renderTask)
    renderTask.cancel()
}

function renderPage(pageNum: number) {
  toRaw(DocumentProxy.value)?.getPage(pageNum).then((page) => {
    cancelRender()

    const viewportParams: GetViewportParameters = {
      scale: computeScale(page),
      rotation: computeRotation(props.rotation!),
    }
    const viewport = page.getViewport(viewportParams)

    const oldCanvas = getCurrentCanvas()
    const canvas = setupCanvas(viewport)

    // Render PDF page into canvas context
    const renderContext: RenderParameters = {
      canvasContext: canvas.getContext('2d')!,
      viewport,
      annotationMode: PDFJS.AnnotationMode.ENABLE_FORMS,
    }

    if (canvas?.getAttribute('role') !== 'main') {
      if (oldCanvas)
        container.value?.replaceChild(canvas, oldCanvas)
    }
    else {
      canvas.removeAttribute('role')
    }

    renderTask = page.render(renderContext)
    renderTask.promise.then(() => {
      PageProxy.value = page
      InternalViewport.value = viewport
      loading.value = false
      emitLoaded(InternalViewport.value!)
    }).catch(() => {
      // render task cancelled
    })
  })
}

function initDoc(proxy: PDFDocumentLoadingTask) {
  proxy.promise.then(async (doc) => {
    DocumentProxy.value = doc
    renderPage(props.page)
  })
}

watch(() => props.pdf, (pdf) => {
  // for any change in pdf proxy, rework all
  if (pdf !== undefined)
    initDoc(pdf)
})

watch(() => [props.scale, props.rotation, props.page], () => {
  renderPage(props.page)
})

onMounted(() => {
  if (props.pdf !== undefined)
    initDoc(props.pdf)
})

function reload() {
  renderPage(props.page)
}

function cancel() {
  cancelRender()
}

defineExpose({
  reload,
  cancel,
})
</script>

<template>
  <div ref="container" style="position: relative; display: block; overflow: hidden;">
    <canvas dir="ltr" style="display: block" role="main" />
    <AnnotationLayer v-show="annotationLayer" :page="PageProxy as PDFPageProxy" :viewport="InternalViewport" :document="DocumentProxy as PDFDocumentProxy" :filter="annotationsFilter!" @annotation="emitAnnotation($event)" />
    <TextLayer v-show="textLayer" :page="PageProxy as PDFPageProxy" :viewport="InternalViewport" />
    <div v-show="loading" ref="loadingLayer" style="display: block; position: absolute">
      <slot />
    </div>
  </div>
</template>
