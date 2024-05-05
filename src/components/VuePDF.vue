<!-- eslint-disable no-case-declarations -->
<script setup lang="ts">
import * as PDFJS from 'pdfjs-dist'
import { computed, onMounted, ref, toRaw, watch } from 'vue'

import 'pdfjs-dist/web/pdf_viewer.css'

import type { PDFDocumentLoadingTask, PDFPageProxy, PageViewport, RenderTask } from 'pdfjs-dist'
import type { GetViewportParameters, PDFDocumentProxy, RenderParameters } from 'pdfjs-dist/types/src/display/api'
import type { AnnotationEventPayload, HighlightEventPayload, HighlightOptions, LoadedEventPayload, TextLayerLoadedEventPayload, WatermarkOptions } from './types'

import AnnotationLayer from './layers/AnnotationLayer.vue'
import TextLayer from './layers/TextLayer.vue'
import XFALayer from './layers/XFALayer.vue'

interface InternalProps {
  page: PDFPageProxy | undefined
  document: PDFDocumentProxy | undefined
  viewport: PageViewport | undefined
}

const props = withDefaults(defineProps<{
  pdf?: PDFDocumentLoadingTask
  page?: number
  scale?: number
  rotation?: number
  fitParent?: boolean
  width?: number
  height?: number
  textLayer?: boolean
  imageResourcesPath?: string
  hideForms?: boolean
  intent?: string
  annotationLayer?: boolean
  annotationsFilter?: string[]
  annotationsMap?: object
  watermarkText?: string
  watermarkOptions?: WatermarkOptions
  highlightText?: string | string[]
  highlightOptions?: HighlightOptions
}>(), {
  page: 1,
  scale: 1,
  intent: 'display',
})

const emit = defineEmits<{
  (event: 'annotation', payload: AnnotationEventPayload): void
  (event: 'highlight', payload: HighlightEventPayload): void
  (event: 'loaded', payload: LoadedEventPayload): void
  (event: 'textLoaded', payload: TextLayerLoadedEventPayload): void
  (event: 'annotationLoaded', payload: any[]): void
  (event: 'xfaLoaded'): void
}>()

// Template Refs
const container = ref<HTMLSpanElement>()
const loadingLayer = ref<HTMLSpanElement>()
const loading = ref(false)
let renderTask: RenderTask

const internalProps = computed(() => {
  return {
    viewport: undefined,
    document: undefined,
    page: undefined,
  } as InternalProps
})
const alayerProps = computed(() => {
  return {
    annotationsMap: props.annotationsMap,
    annotationsFilter: props.annotationsFilter,
    imageResourcesPath: props.imageResourcesPath,
    hideForms: props.hideForms,
    intent: props.intent,
  }
})
const tlayerProps = computed(() => {
  return {
    highlightText: props.highlightText,
    highlightOptions: props.highlightOptions,
  }
})

function getWatermarkOptionsWithDefaults(): WatermarkOptions {
  return Object.assign({}, {
    columns: 4,
    rows: 4,
    rotation: 45,
    fontSize: 18,
    color: 'rgba(211, 210, 211, 0.4)',
  }, props.watermarkOptions)
}

function getRotation(rotation: number): number {
  if (!(typeof rotation === 'number' && rotation % 90 === 0))
    return 0
  const factor = rotation / 90
  if (factor > 4)
    return getRotation(rotation - 360)
  else if (factor < 0)
    return getRotation(rotation + 360)
  return rotation
}

function getScale(page: PDFPageProxy): number {
  let fscale = props.scale
  if (props.fitParent) {
    const parentWidth: number = (container.value!.parentNode! as HTMLElement).clientWidth
    const scale1Width = page.getViewport({ scale: 1 }).width
    fscale = parentWidth / scale1Width
  }
  else if (props.width) {
    const scale1Width = page.getViewport({ scale: 1 }).width
    fscale = props.width / scale1Width
  }
  else if (props.height) {
    const scale1Height = page.getViewport({ scale: 1 }).height
    fscale = props.height / scale1Height
  }
  return fscale
}

function paintWatermark(zoomRatio = 1.0) {
  if (!props.watermarkText)
    return

  const canvas = getCurrentCanvas()
  if (!canvas)
    return

  const ctx = canvas.getContext('2d')
  if (!ctx)
    return

  const mergeOptions = getWatermarkOptionsWithDefaults()

  const text = props.watermarkText
  const columns = mergeOptions.columns!
  const rows = mergeOptions.rows!
  const numWatermarks = columns * rows
  const rotation = mergeOptions.rotation!
  const pixels = mergeOptions.fontSize! * zoomRatio
  ctx.font = `${pixels}px Trebuchet MS`
  ctx.fillStyle = mergeOptions.color!

  for (let i = 0; i < numWatermarks; i++) {
    const x = (i % columns) * (canvas.width / columns) + canvas.width / (columns * 2)
    const y = Math.floor(i / columns) * (canvas.height / rows) + canvas.height / (rows * 2)

    const textWidth = ctx.measureText(text).width
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(-rotation * (Math.PI / 180))
    ctx.fillText(text, -textWidth / 2, pixels / 2)
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
  toRaw(internalProps.value.document)?.getPage(pageNum).then((page) => {
    cancelRender()

    const defaultViewport = page.getViewport()
    const viewportParams: GetViewportParameters = {
      scale: getScale(page),
      rotation: getRotation((props.rotation || 0) + defaultViewport.rotation),
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
      intent: props.intent,
    }

    if (canvas?.getAttribute('role') !== 'main') {
      if (oldCanvas)
        container.value?.replaceChild(canvas, oldCanvas)
    }
    else {
      canvas.removeAttribute('role')
    }

    internalProps.value.page = page
    internalProps.value.viewport = viewport
    renderTask = page.render(renderContext)
    renderTask.promise.then(() => {
      loading.value = false
      paintWatermark(viewport.scale)
      emit('loaded', internalProps.value.viewport!)
    }).catch(() => {
      // render task cancelled
    })
  })
}

function initDoc(proxy: PDFDocumentLoadingTask) {
  proxy.promise.then(async (document) => {
    internalProps.value.document = document
    renderPage(props.page)
  })
}

watch(() => props.pdf, (pdf) => {
  // For any changes on pdf, reinicialize all
  if (pdf !== undefined)
    initDoc(pdf)
})

watch(() => [
  props.scale,
  props.width,
  props.height,
  props.rotation,
  props.page,
  props.hideForms,
  props.intent,
], () => {
  // Props that should dispatch an render task
  renderPage(props.page)
})

onMounted(() => {
  if (props.pdf !== undefined)
    initDoc(props.pdf)
})

// Exposed methods
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
  <div ref="container" style="position: relative; display: block;">
    <canvas dir="ltr" style="display: block" role="main" />
    <AnnotationLayer
      v-if="annotationLayer"
      v-bind="{ ...internalProps, ...alayerProps }"
      @annotation="emit('annotation', $event)"
      @annotation-loaded="emit('annotationLoaded', $event)"
    />
    <TextLayer
      v-if="textLayer"
      v-bind="{ ...internalProps, ...tlayerProps }"
      @highlight="emit('highlight', $event)"
      @text-loaded="emit('textLoaded', $event)"
    />
    <XFALayer
      v-bind="{ ...internalProps }"
      @xfa-loaded="emit('xfaLoaded')"
    />
    <div v-show="loading" ref="loadingLayer" style="position: absolute;">
      <slot />
    </div>
  </div>
</template>
