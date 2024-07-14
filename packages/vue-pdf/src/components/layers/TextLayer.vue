<script setup lang="ts">
import * as PDFJS from 'pdfjs-dist'
import { onMounted, ref, watch } from 'vue'

import type { PDFPageProxy, PageViewport } from 'pdfjs-dist'
import type { TextLayerRenderParameters } from 'pdfjs-dist/types/src/display/text_layer'
import type { HighlightEventPayload, HighlightOptions, TextLayerLoadedEventPayload } from '../types'
import { findMatches, highlightMatches, resetDivs } from '../utils/highlight'

const props = defineProps<{
  page?: PDFPageProxy
  viewport?: PageViewport
  highlightText?: string | string[]
  highlightOptions?: HighlightOptions
}>()

const emit = defineEmits<{
  (event: 'highlight', payload: HighlightEventPayload): void
  (event: 'textLoaded', payload: TextLayerLoadedEventPayload): void
}>()

const layer = ref<HTMLDivElement>()
const endContent = ref<HTMLDivElement>()

const textDivs: HTMLElement[] = []

function getHighlightOptionsWithDefaults(): HighlightOptions {
  return Object.assign({}, {
    ignoreCase: true,
    completeWords: false,
  }, props.highlightOptions)
}

async function findAndHighlight(reset = false) {
  const page = props.page
  const textContent = await page?.getTextContent()

  if (!textContent)
    return

  if (reset)
    resetDivs(textContent, textDivs)

  if (props.highlightText) {
    const queries = typeof props.highlightText === 'string' ? [props.highlightText] : props.highlightText
    const matches = findMatches(queries, textContent!, getHighlightOptionsWithDefaults())
    highlightMatches(matches, textContent!, textDivs)
    emit('highlight', {
      matches,
      textContent,
      textDivs,
      page: page?.pageNumber || 1,
    })
  }
}

function render() {
  layer.value!.replaceChildren?.()
  textDivs.splice(0, textDivs.length)

  const page = props.page
  const viewport = props.viewport

  const textStream = page?.streamTextContent({ includeMarkedContent: true, disableNormalization: true })
  const parameters: TextLayerRenderParameters = {
    textContentSource: textStream!,
    viewport: viewport!,
    container: layer.value!,
    textDivs,
    textDivProperties: new WeakMap(),
  }

  const task = PDFJS.renderTextLayer(parameters)
  task.promise.then(async () => {
    const textContent = await page?.getTextContent()
    emit('textLoaded', {
      textDivs,
      textContent,
    })
    const endOfContent = document.createElement('div')
    endOfContent.className = 'endOfContent'
    layer.value?.appendChild(endOfContent)
    endContent.value = endOfContent
    findAndHighlight()
  })
}

function onMouseDown() {
  if (!endContent.value)
    return
  endContent.value.classList.add('active')
}

function onMouseUp() {
  if (!endContent.value)
    return
  endContent.value.classList.remove('active')
}

watch(() => props.viewport, (_) => {
  if (props.page && props.viewport && layer.value)
    render()
})

watch(() => [props.highlightText, props.highlightOptions], (_) => {
  findAndHighlight(true)
}, { deep: true })

onMounted(() => {
  if (props.page && props.viewport && layer.value)
    render()
})
</script>

<template>
  <div ref="layer" class="textLayer" style="display: block;" @mousedown="onMouseDown" @mouseup="onMouseUp" />
</template>
