<!-- eslint-disable no-case-declarations -->
<script setup lang="ts">
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist'
import * as PDFJSViewer from 'pdfjs-dist/web/pdf_viewer'
import * as PDFJSLib from 'pdfjs-dist/build/pdf'
import { SimpleLinkService } from 'pdfjs-dist/web/pdf_viewer'
import 'pdfjs-dist/web/pdf_viewer.css'
import { onMounted, ref, watch } from 'vue'
import type { GetViewportParameters, RenderParameters } from 'pdfjs-dist/types/src/display/api'
import type { AnnotationEventPayload, LoadedEventPayload } from './types'
import { EVENTS_TO_HANDLER, annotationEventsHandler } from './utils/annotations'

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
const TextlayerREF = ref<HTMLDivElement>()
const AnnotationlayerREF = ref<HTMLDivElement>()
const ContainerREF = ref<HTMLSpanElement>()
const LoadlayerREF = ref<HTMLSpanElement>()
const loadingLayer = ref(true)

// PDF objects
let Annotations: Object[] = []
let PDFDoc: PDFDocumentProxy | null = null
let TextLayerLoaded = false
let AnnotationLayerLoaded = false
let FieldObjects: Record<string, Object[]> = {}

function emitLoaded(data: LoadedEventPayload) {
  emit('loaded', data)
}

function emitAnnotation(data: AnnotationEventPayload) {
  emit('annotation', data)
}

function annotationsEvents(evt: Event) {
  const value = annotationEventsHandler(evt, PDFDoc as PDFDocumentProxy, Annotations)
  Promise.resolve(value).then((data) => {
    if (data)
      emitAnnotation(data)
  })
}

function renderPage(pageNum: number) {
  PDFDoc?.getPage(pageNum).then((page) => {
    let emitLoadedEvent = false

    let fscale = props.scale
    if (props.fitParent) {
      const parentWidth: number = (ContainerREF.value!.parentNode! as HTMLElement).clientWidth
      const scale1Width = page.getViewport({ scale: 1 }).width
      fscale = parentWidth / scale1Width
    }

    const viewportParams: GetViewportParameters = {
      scale: fscale,
    }

    // Set rotation param only if is a valid number
    if (typeof props.rotation === 'number' && props.rotation % 90 === 0)
      viewportParams.rotation = props.rotation

    const viewport = page.getViewport(viewportParams)
    const ctx = CanvasREF.value!.getContext('2d')

    CanvasREF.value!.width = viewport.width
    CanvasREF.value!.height = viewport.height
    CanvasREF.value!.style.width = `${viewport.width}px`
    CanvasREF.value!.style.height = `${viewport.height}px`
    LoadlayerREF.value!.style.width = `${viewport.width}px`
    LoadlayerREF.value!.style.height = `${viewport.height}px`

    // Render PDF page into canvas context
    const renderContext: RenderParameters = {
      canvasContext: ctx!,
      viewport,
    }

    page.render(renderContext).promise.then(() => {
      loadingLayer.value = false
      // Load text layer if prop is true
      if (props.textLayer) {
        page.getTextContent().then((textContent) => {
          TextlayerREF.value!.style.left = `${CanvasREF.value!.offsetLeft}px`
          TextlayerREF.value!.style.top = `${CanvasREF.value!.offsetTop}px`
          TextlayerREF.value!.style.height = `${CanvasREF.value!.offsetHeight}px`
          TextlayerREF.value!.style.width = `${CanvasREF.value!.offsetWidth}px`

          // Render text using TextLayerBuilder from pdfjs viewer
          const TextLayerBuilder = new PDFJSViewer.TextLayerBuilder({
            textLayerDiv: TextlayerREF.value,
            pageIndex: page._pageIndex,
            eventBus: new PDFJSViewer.EventBus(),
            viewport,
            enhanceTextSelection: false,
          })
          TextLayerBuilder.setTextContent(textContent)
          TextLayerBuilder.render()
          TextLayerLoaded = true
        })
      }

      // Load annotaion layer if prop is true
      if (props.annotationLayer) {
        emitLoadedEvent = true
        page.getAnnotations().then((annotations) => {
          AnnotationlayerREF.value!.style.left = `${CanvasREF.value!.offsetLeft}px`
          AnnotationlayerREF.value!.style.top = `${CanvasREF.value!.offsetTop}px`
          AnnotationlayerREF.value!.style.height = `${CanvasREF.value!.offsetHeight}px`
          AnnotationlayerREF.value!.style.width = `${CanvasREF.value!.offsetWidth}px`
          if (props.annotationsFilter) {
            annotations = annotations.filter((value) => {
              const filters = props.annotationsFilter
              const subType = value.subtype
              const fieldType = value.fieldType ? `${subType}.${value.fieldType}` : null

              return filters?.includes(subType) || (fieldType !== null && filters?.includes(fieldType))
            })
          }

          // Canvas map for push button widget
          const canvasMap = new Map<string, HTMLCanvasElement>([])
          for (const anno of annotations) {
            if (anno.subtype === 'Widget' && anno.fieldType === 'Btn' && anno.pushButton) {
              const canvasWidth = anno.rect[2] - anno.rect[0]
              const canvasHeight = anno.rect[3] - anno.rect[1]
              const subCanvas = document.createElement('canvas')
              subCanvas.setAttribute('width', (canvasWidth * fscale).toString())
              subCanvas.setAttribute('height', (canvasHeight * fscale).toString())
              canvasMap.set(anno.id, subCanvas)
            }
          }
          PDFJSLib.AnnotationLayer.render({
            annotations,
            viewport: viewport.clone({ dontFlip: true }),
            page,
            linkService: new SimpleLinkService(), // no pdfviewer features needed, send void LinkService
            div: AnnotationlayerREF.value!,
            enableScripting: true,
            hasJSActions: true,
            annotationCanvasMap: canvasMap,
            // @ts-expect-error - private property
            fieldObjects: FieldObjects,
          })
          Annotations = annotations
          AnnotationLayerLoaded = true
          emitLoaded({ ...viewport, annotations: Annotations })

          // Add event listeners to manage some events of annotations layer items
          for (const evtHandler of EVENTS_TO_HANDLER)
            AnnotationlayerREF.value!.addEventListener(evtHandler, annotationsEvents)
        })
      }
      if (!emitLoadedEvent)
        emitLoaded(viewport)
    })
  })
}

function clearLayers() {
  // Clear all childnodes of layer elements
  TextlayerREF.value!.replaceChildren?.()
  AnnotationlayerREF.value!.replaceChildren?.()
  // Clear event listeners of annotation layer
  for (const evtHandler of EVENTS_TO_HANDLER)
    AnnotationlayerREF.value!.removeEventListener?.(evtHandler, annotationsEvents)
}

function initDoc(proxy: PDFDocumentLoadingTask) {
  proxy.promise.then((doc) => {
    PDFDoc = doc
    PDFDoc.getFieldObjects().then((data) => {
      if (data)
        FieldObjects = data
    })
    renderPage(props.page)
  })
}

watch(() => props.pdf, (pdf) => {
  // for any change in pdf proxy, rework all
  if (pdf !== undefined) {
    clearLayers()
    initDoc(pdf)
  }
})

watch(() => props.textLayer, (textLayer) => {
  if (textLayer) {
    // If text-layer has no been loaded before, rework the render task
    if (!TextLayerLoaded)
      renderPage(props.page)
  }
})

watch(() => props.annotationLayer, (annotationLayer) => {
  if (annotationLayer) {
    // If annotation-layer has no been loaded before, rework the render task
    if (!AnnotationLayerLoaded)
      renderPage(props.page)
  }
})

// WHhen annotations filter change rework render task
watch(() => props.annotationsFilter, () => {
  clearLayers()
  renderPage(props.page)
})

watch(() => props.scale, (_) => {
  // When scale change rework render task
  clearLayers()
  renderPage(props.page)
})

watch(() => props.rotation, (_) => {
  // When rotation change rework render task
  clearLayers()
  renderPage(props.page)
})

watch(() => props.page, (page) => {
  // When page change rework render task
  clearLayers()
  renderPage(page)
})

onMounted(() => {
  if (props.pdf !== undefined)
    initDoc(props.pdf)
})

function reload() {
  clearLayers()
  renderPage(props.page)
}

defineExpose({
  reload,
})
</script>

<template>
  <span ref="ContainerREF" style="position: relative; display: flex;">
    <canvas ref="CanvasREF" style="display: inline-block" />
    <div v-show="annotationLayer" ref="AnnotationlayerREF" class="annotationLayer" style="display: block;" />
    <div v-show="textLayer" ref="TextlayerREF" class="textLayer" style="display: block;" />
    <div v-show="loadingLayer" ref="LoadlayerREF" style="display: block; position: absolute;">
      <slot />
    </div>
  </span>
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
