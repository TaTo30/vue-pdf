<!-- eslint-disable no-case-declarations -->
<script setup lang="ts">
import * as PDFJS from 'pdfjs-dist'
import { onMounted, ref, toRaw, watch } from 'vue'

import 'pdfjs-dist/web/pdf_viewer.css'

import type { PDFDocumentLoadingTask, PDFDocumentProxy, PDFPageProxy, PageViewport, RenderTask } from 'pdfjs-dist'
import type { GetViewportParameters, RenderParameters } from 'pdfjs-dist/types/src/display/api'
import type { AnnotationEventPayload, LoadedEventPayload } from './types'

import AnnotationLayer from './layers/AnnotationLayer.vue'
import TextLayer from './layers/TextLayer.vue'
import XFALayer from './layers/XFALayer.vue'

const props = withDefaults(defineProps<{
  pdf?: PDFDocumentLoadingTask
  page?: number
  scale?: number
  rotation?: number
  fitParent?: boolean
  textLayer?: boolean
  imageResourcesPath?: string
  hideForms?: boolean
  annotationLayer?: boolean
  annotationsFilter?: string[]
  annotationsMap?: object
  watermarkText?: string
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
const DocumentProxy = ref<PDFDocumentProxy>()
const PageProxy = ref<PDFPageProxy>()
const InternalViewport = ref<PageViewport>()

function emitLoaded(data: LoadedEventPayload) {
  emit('loaded', data)
}

function emitAnnotation(data: AnnotationEventPayload) {
  emit('annotation', data)
}

function computeRotation(rotation: number): number {
  if (!(typeof rotation === 'number' && rotation % 90 === 0))
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

function paintWatermark(canvas: HTMLCanvasElement, baseFontSize = 18, zoomRatio = 1.0) {
  if (!props.watermarkText)
    return

  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
  if (!ctx)
    return

  ctx.font = `${baseFontSize * zoomRatio}px Trebuchet MS`
  ctx.fillStyle = 'rgba(211, 210, 211, 0.3)'

  const numWatermarks = 50 // Adjust the number of watermarks as desired

  for (let i = 0; i < numWatermarks; i++) {
    const x = (i % 5) * (canvas.width / 5) + canvas.width / 10
    const y = Math.floor(i / 5) * (canvas.height / 5) + canvas.height / 10

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(-(Math.PI / 4))
    ctx.fillText(props.watermarkText, 0, 0)
    ctx.restore()
  }
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

  const outputScale = window.devicePixelRatio || 1
  canvas.width = Math.floor(viewport.width * outputScale)
  canvas.height = Math.floor(viewport.height * outputScale)

  canvas.style.width = `${Math.floor(viewport.width)}px`
  canvas.style.height = `${Math.floor(viewport.height)}px`

  // --scale-factor property
  container.value?.style.setProperty('--scale-factor', `${viewport.scale}`)
  // Also setting dimension properties for load layer
  loadingLayer.value!.style.width = `${Math.floor(viewport.width)}px`
  loadingLayer.value!.style.height = `${Math.floor(viewport.height)}px`
  loadingLayer.value!.style.top = '0'
  loadingLayer.value!.style.left = '0'
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

    const defaultViewport = page.getViewport()
    const viewportParams: GetViewportParameters = {
      scale: computeScale(page),
      rotation: computeRotation((props.rotation || 0) + defaultViewport.rotation),
    }
    const viewport = page.getViewport(viewportParams)

    const oldCanvas = getCurrentCanvas()
    const canvas = setupCanvas(viewport)

    const outputScale = window.devicePixelRatio || 1
    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined

    // Render PDF page into canvas context
    const renderContext: RenderParameters = {
      canvasContext: canvas.getContext('2d')!,
      viewport,
      annotationMode: props.hideForms ? PDFJS.AnnotationMode.ENABLE : PDFJS.AnnotationMode.ENABLE_FORMS,
      transform,
    }

    if (canvas?.getAttribute('role') !== 'main') {
      if (oldCanvas)
        container.value?.replaceChild(canvas, oldCanvas)
    }
    else {
      canvas.removeAttribute('role')
    }

    PageProxy.value = page
    InternalViewport.value = viewport
    renderTask = page.render(renderContext)
    renderTask.promise.then(() => {
      paintWatermark(canvas, 18, viewport.scale)
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

watch(() => [props.scale, props.rotation, props.page, props.hideForms, props.watermarkText], () => {
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

function getAnnotationStorage() {
  const pdf = toRaw(DocumentProxy.value)
  return pdf?.annotationStorage
}

defineExpose({
  reload,
  cancel,
  getAnnotationStorage,
})
</script>

<template>
  <div ref="container" style="position: relative; display: block; overflow: hidden;">
    <canvas dir="ltr" style="display: block" role="main" />
    <AnnotationLayer
      v-show="annotationLayer"
      :filter="annotationsFilter!"
      :map="annotationsMap"
      :viewport="InternalViewport!"
      :image-resources-path="imageResourcesPath"
      :hide-forms="hideForms"
      :page="PageProxy!"
      :document="DocumentProxy!"
      @annotation="emitAnnotation($event)"
    />
    <TextLayer v-show="textLayer" :page="PageProxy!" :viewport="InternalViewport!" />
    <XFALayer :page="PageProxy!" :viewport="InternalViewport!" :document="DocumentProxy!" />
    <div v-show="loading" ref="loadingLayer" style="position: absolute;">
      <slot />
    </div>
  </div>
</template>
