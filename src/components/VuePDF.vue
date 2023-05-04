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

const INTERNAL_LINK = 'internal-link'
const LINK = 'link'
const FILE_ATTACHMENT = 'file-attachment'
const FORM_TEXT = 'form-text'
const FORM_SELECT = 'form-select'
const FORM_CHECKBOX = 'form-checkbox'
const FORM_RADIO = 'form-radio'
const FORM_BUTTON = 'form-button'

const EVENTS_TO_HANDLER = ['click', 'dblclick', 'mouseover', 'input', 'change']

// Template elements
const CanvasREF = ref<HTMLCanvasElement>()
const TextlayerREF = ref<HTMLDivElement>()
const AnnotationlayerREF = ref<HTMLDivElement>()
const ContainerREF = ref<HTMLSpanElement>()

// PDF objects
let PDFDoc: PDFDocumentProxy | null = null
let TextLayerLoaded = false
let AnnotationLayerLoaded = false
let Annotations: Record<string, any>[] = []
let FieldObjects: Record<string, Object[]> = {}

// Use this function to handle annotation events
function annotationEventsHandler(evt: Event) {
  let annotation = (evt.target as HTMLInputElement).parentNode! as HTMLElement
  // annotations are <section> elements if div returned find in child nodes the section element
  // TODO this part in recursive mode
  if (annotation.tagName === 'DIV')
    annotation = annotation.firstChild! as HTMLElement

  // For linkAnnotation events get only click events
  if (annotation.className === 'linkAnnotation' && evt.type === 'click') {
    const id: string | undefined = annotation.dataset?.annotationId
    if (id)
      linkAnnotationHandler(getAnnotationsByKey('id', id)[0])
      // For popups annotations
  }
  else if (annotation.className === 'popupAnnotation' || annotation.className === 'textAnnotation' || annotation.className === 'fileAttachmentAnnotation') {
    for (const spanElement of annotation.getElementsByTagName('span')) {
      let content = spanElement.textContent
      const args = JSON.parse(spanElement.dataset.l10nArgs ?? '{}')
      if (content) {
        for (const key in args)
          content = content.replace(`{{${key}}}`, args[key])
      }
      spanElement.textContent = content
    }
    if (annotation.className === 'fileAttachmentAnnotation' && evt.type === 'dblclick') {
      const id = annotation.dataset.annotationId
      if (id)
        fileAnnotationHandler(getAnnotationsByKey('id', id)[0])
    }
    // TextFields and TextAreas
  }
  else if (annotation.className === 'textWidgetAnnotation' && evt.type === 'input') {
    let inputElement: HTMLInputElement | HTMLTextAreaElement = annotation.getElementsByTagName('input')[0]
    if (!inputElement)
      inputElement = annotation.getElementsByTagName('textarea')[0]

    inputAnnotationHandler(inputElement)
  }
  else if (annotation.className === 'choiceWidgetAnnotation' && evt.type === 'input') {
    inputAnnotationHandler(annotation.getElementsByTagName('select')[0])
  }
  else if (annotation.className === 'buttonWidgetAnnotation checkBox' && evt.type === 'change') {
    inputAnnotationHandler(annotation.getElementsByTagName('input')[0])
  }
  else if (annotation.className === 'buttonWidgetAnnotation radioButton' && evt.type === 'change') {
    const id = annotation.dataset.annotationId
    if (id) {
      const anno = getAnnotationsByKey('id', id)[0]
      const radioOptions = []
      for (const radioAnnotations of getAnnotationsByKey('fieldName', anno.fieldName)) {
        if (radioAnnotations.buttonValue)
          radioOptions.push(radioAnnotations.buttonValue)
      }
      inputAnnotationHandler(annotation.getElementsByTagName('input')[0], {
        value: anno.buttonValue,
        defaultValue: anno.fieldValue,
        options: radioOptions,
      })
    }
  }
  else if (annotation.className === 'buttonWidgetAnnotation pushButton' && evt.type === 'click') {
    const id = annotation.dataset.annotationId
    if (id) {
      const anno = getAnnotationsByKey('id', id)[0]
      if (!anno.resetForm)
        inputAnnotationHandler({ name: anno.fieldName, type: 'button' }, { actions: anno.actions, reset: false })
      else
        inputAnnotationHandler({ name: anno.fieldName, type: 'button' }, { actions: anno.actions, reset: true })
    }
  }
  // Another Annotations manage here
}

function inputAnnotationHandler(inputEl: any, args?: any) {
  switch (inputEl.type) {
    case 'textarea':
    case 'text':
      emitAnnotation(FORM_TEXT, {
        fieldName: inputEl.name,
        value: inputEl.value,
      })
      break
    case 'select-one':
    case 'select-multiple':
      const options = []
      for (const opt of inputEl.options) {
        options.push({
          value: opt.value,
          label: opt.label,
        })
      }
      const selected = []
      for (const opt of inputEl.selectedOptions) {
        selected.push({
          value: opt.value,
          label: opt.label,
        })
      }
      emitAnnotation(FORM_SELECT, {
        fieldName: inputEl.name,
        value: selected,
        options,
      })
      break
    case 'checkbox':
      emitAnnotation(FORM_CHECKBOX, {
        fieldName: inputEl.name,
        checked: inputEl.checked,
      })
      break
    case 'radio':
      emitAnnotation(FORM_RADIO, {
        fieldName: inputEl.name,
        ...args,
      })
      break
    case 'button':
      emitAnnotation(FORM_BUTTON, {
        fieldName: inputEl.name,
        ...args,
      })
      break
    default:
      break
  }
}

function fileAnnotationHandler(annotation: any) {
  return emitAnnotation(FILE_ATTACHMENT, annotation.file)
}

function linkAnnotationHandler(annotation: { dest?: any; url?: string; unsafeUrl?: string }) {
  if (annotation.dest) {
    // Get referenced page number of internal link
    PDFDoc!.getPageIndex(annotation.dest[0]).then((pageIndex) => {
      const eventInfo = {
        referencedPage: pageIndex + 1,
        offset: {
          left: annotation.dest[2],
          bottom: annotation.dest[3],
        },
      }
      emitAnnotation(INTERNAL_LINK, eventInfo)
    })
  }
  else if (annotation.url) {
    const eventInfo = {
      url: annotation.url,
      unsafeUrl: annotation.unsafeUrl,
    }
    emitAnnotation(LINK, eventInfo)
  }
}

function getAnnotationsByKey(key: string, value: any) {
  const result = []
  for (const annotation of Annotations) {
    if (annotation[key] === value)
      result.push(annotation)
  }
  return result
}

function emitAnnotation(type: string, data: any) {
  emit('annotation', { type, data })
}

function emitLoaded(data: LoadedEventPayload) {
  emit('loaded', data)
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

    // Render PDF page into canvas context
    const renderContext: RenderParameters = {
      canvasContext: ctx!,
      viewport,
    }

    page.render(renderContext).promise.then(() => {
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
            AnnotationlayerREF.value!.addEventListener(evtHandler, annotationEventsHandler)
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
    AnnotationlayerREF.value!.removeEventListener?.(evtHandler, annotationEventsHandler)
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
  z-index: 1;
}
</style>
