<!-- eslint-disable no-case-declarations -->
// import { SimpleLinkService } from 'pdfjs-dist/web/pdf_viewer'
<script setup lang="ts">
import 'pdfjs-dist/web/pdf_viewer.css'
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

// Template elements
const CanvasREF = ref<HTMLCanvasElement>()
// const AnnotationlayerREF = ref<HTMLDivElement>()
const ContainerREF = ref<HTMLSpanElement>()
const LoadlayerREF = ref<HTMLSpanElement>()
const loadingLayer = ref(true)

// PDF References
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

function renderPage(pageNum: number) {
  toRaw(DocumentProxy.value)?.getPage(pageNum).then((page) => {
    const viewportParams: GetViewportParameters = {
      scale: computeScale(page),
      rotation: computeRotation(props.rotation!),
    }

    const viewport = page.getViewport(viewportParams)
    InternalViewport.value = viewport

    CanvasREF.value!.width = viewport.width
    CanvasREF.value!.height = viewport.height

    CanvasREF.value!.style.width = `${viewport.width}px`
    CanvasREF.value!.style.height = `${viewport.height}px`
    CanvasREF.value!.style.visibility = 'hidden'

    LoadlayerREF.value!.style.width = `${viewport.width}px`
    LoadlayerREF.value!.style.height = `${viewport.height}px`

    // Render PDF page into canvas context
    const renderContext: RenderParameters = {
      canvasContext: CanvasREF.value!.getContext('2d', { alpha: false })!,
      viewport,
    }

    page.render(renderContext).promise.then(() => {
      PageProxy.value = page
      loadingLayer.value = false

      CanvasREF.value!.style.visibility = ''
      emitLoaded(viewport)
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

watch(() => props.scale, (_) => {
  // When scale change rework render task
  renderPage(props.page)
  // CanvasREF.value!.style.transform = 'scale(2, 2)'
})

watch(() => props.rotation, (_) => {
  // When rotation change rework render task
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
    <canvas ref="CanvasREF" style="display: inline-block" />
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
