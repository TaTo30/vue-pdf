<script setup lang="ts">
import * as PDFJS from "pdfjs-dist";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

import type { PDFPageProxy, PageViewport } from "pdfjs-dist";
import type {
  HighlightEventPayload,
  HighlightOptions,
  TextLayerLoadedEventPayload,
} from "../types";
import { findMatches, highlightMatches, resetDivs } from "../utils/highlight";

const props = defineProps<{
  page?: PDFPageProxy;
  viewport?: PageViewport;
  highlightText?: string | string[];
  highlightOptions?: HighlightOptions;
  highlightPages?: number[];
}>();

const emit = defineEmits<{
  (event: "highlight", payload: HighlightEventPayload): void;
  (event: "textLoaded", payload: TextLayerLoadedEventPayload): void;
}>();

const layer = ref<HTMLDivElement>();
const endContent = ref<HTMLDivElement>();
let textDivs: HTMLElement[] = [];
let textLayerTask: PDFJS.TextLayer | null = null;

function getHighlightOptionsWithDefaults(): HighlightOptions {
  return Object.assign(
    {},
    {
      ignoreCase: true,
      completeWords: false,
    },
    props.highlightOptions
  );
}

async function findAndHighlight(reset = false) {
  const page = props.page;
  const textContent = await page?.getTextContent();

  if (!textContent) return;

  if (reset) resetDivs(textContent, textDivs);

  if (
    props.highlightText &&
    (!props.highlightPages || props.highlightPages.includes(page!.pageNumber))
  ) {
    const queries =
      typeof props.highlightText === "string"
        ? [props.highlightText]
        : props.highlightText;
    const matches = findMatches(
      queries,
      textContent!,
      getHighlightOptionsWithDefaults()
    );
    highlightMatches(matches, textContent!, textDivs);
    emit("highlight", {
      matches,
      textContent,
      textDivs,
      page: page?.pageNumber || 1,
    });
  }
}

async function render() {
  textLayerTask?.cancel();
  layer.value!.replaceChildren?.();

  const page = props.page;
  const viewport = props.viewport;
  const textStream = page?.streamTextContent({
    includeMarkedContent: true,
    disableNormalization: true,
  });
  const textLayer = new PDFJS.TextLayer({
    container: layer.value!,
    textContentSource: textStream!,
    viewport: viewport!,
  });

  textLayerTask = textLayer;
  await textLayer.render();

  textDivs = textLayer.textDivs;
  const textContent = await page?.getTextContent();
  emit("textLoaded", { textDivs, textContent });

  setEOC();
  findAndHighlight();
}

function setEOC() {
  const endOfContent = document.createElement("div");
  endOfContent.className = "endOfContent";
  layer.value?.appendChild(endOfContent);
  endContent.value = endOfContent;
}

function onMouseDown() {
  if (!endContent.value) return;
  endContent.value.classList.add("active");
}

function onMouseUp() {
  if (!endContent.value) return;
  endContent.value.classList.remove("active");
}

watch(
  () => props.viewport,
  (_) => {
    if (props.page && props.viewport && layer.value) render();
  }
);

watch(
  () => [props.highlightText, props.highlightOptions],
  (_) => {
    findAndHighlight(true);
  },
  { deep: true }
);

onMounted(() => {
  if (props.page && props.viewport && layer.value) render();
});
</script>

<template>
  <div
    ref="layer"
    class="textLayer"
    style="display: block"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
  />
</template>
