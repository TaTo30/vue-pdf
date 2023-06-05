<!-- eslint-disable no-case-declarations -->
// import { SimpleLinkService } from 'pdfjs-dist/web/pdf_viewer'
<script setup lang="ts">
// TODO:
// Reimplements annotation-filter

import { AnnotationMode } from 'pdfjs-dist'
import { onMounted, ref, toRaw, watch } from 'vue'

import type { PDFDocumentLoadingTask, PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist'
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
const ContainerREF = ref<HTMLSpanElement>()
const LoadlayerREF = ref<HTMLSpanElement>()
const loadingLayer = ref(true)

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
    const parentWidth: number = (ContainerREF.value!.parentNode! as HTMLElement).clientWidth
    const scale1Width = page.getViewport({ scale: 1 }).width
    fscale = parentWidth / scale1Width
  }
  ContainerREF.value?.style.setProperty('--scale-factor', `${fscale}`)
  return fscale
}

function setupCanvas(viewport: PageViewport) {
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height

  canvas.style.width = `${viewport.width}px`
  canvas.style.height = `${viewport.height}px`
  canvas.style.visibility = 'hidden'
  canvas.style.display = 'none'

  // Also setting dimension properties for load layer
  LoadlayerREF.value!.style.width = `${viewport.width}px`
  LoadlayerREF.value!.style.height = `${viewport.height}px`
  return canvas
}

function getOldCanvas() {
  let oldCanvas = null
  ContainerREF.value?.childNodes.forEach((el) => {
    if ((el as HTMLElement).tagName === 'CANVAS')
      oldCanvas = el
  })
  return oldCanvas
}

function renderPage(pageNum: number) {
  toRaw(DocumentProxy.value)?.getPage(pageNum).then((page) => {
    const viewportParams: GetViewportParameters = {
      scale: computeScale(page),
      rotation: computeRotation(props.rotation!),
    }

    InternalViewport.value = page.getViewport(viewportParams)

    const canvas = setupCanvas(InternalViewport.value)
    const oldCanvas = getOldCanvas()
    ContainerREF.value?.appendChild(canvas)

    // Render PDF page into canvas context
    const renderContext: RenderParameters = {
      canvasContext: canvas.getContext('2d', { alpha: false })!,
      viewport: InternalViewport.value,
      annotationMode: AnnotationMode.ENABLE_FORMS,
    }

    page.render(renderContext).promise.then(() => {
      PageProxy.value = page
      loadingLayer.value = false
      if (oldCanvas)
        ContainerREF.value?.removeChild(oldCanvas)
      canvas.style.display = 'inline-block'
      canvas.style.visibility = ''
      emitLoaded(InternalViewport.value!)
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

// WHhen annotations filter change rework render task
watch(() => props.annotationsFilter, () => {
  renderPage(props.page)
})

watch(() => [props.scale, props.rotation], (_) => {
  renderPage(props.page)
})

watch(() => props.page, (page) => {
  renderPage(page)
})

onMounted(() => {
  if (props.pdf !== undefined)
    initDoc(props.pdf)
})

function reload() {
  renderPage(props.page)
}

defineExpose({
  reload,
})
</script>

<template>
  <span ref="ContainerREF" style="position: relative; display: inline-block;">
    <AnnotationLayer v-show="annotationLayer" :page="PageProxy" :viewport="InternalViewport" :document="DocumentProxy" @annotation="emitAnnotation($event)" />
    <TextLayer v-show="textLayer" :page="PageProxy" :viewport="InternalViewport" />
    <div v-show="loadingLayer" ref="LoadlayerREF" style="display: block;" class="loadingLayer">
      <slot />
    </div>
  </span>
</template>

<style>
.loadingLayer {
  position: absolute;
  left: 0;
  top: 0;
}
</style>
