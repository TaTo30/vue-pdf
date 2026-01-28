<script setup lang="ts">
import * as PDFJS from "pdfjs-dist";
import { inject, onMounted, Ref, ref, watch } from "vue";

import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from "pdfjs-dist";
import { GenericL10n } from "../utils/l10n";

import MinimalUiManager from "../utils/manager";
import {
  ANNOTATION_LAYER_INSTANCE_KEY,
  TEXT_LAYER_CONTAINER_KEY,
} from "../utils/symbols";
import { AnnotationEditorConstructor } from "../types";

const props = defineProps<{
  page?: PDFPageProxy;
  viewport?: PageViewport;
  document?: PDFDocumentProxy;
  annotationsFilter?: string[];
  annotationsMap?: object;
  imageResourcesPath?: string;
  hideForms?: boolean;
  enableScripting?: boolean;
  intent: string;
}>();

const layer = ref<HTMLDivElement>();

let editor: any = null;

const textLayerInstance: Ref<HTMLDivElement | null> = inject(
  TEXT_LAYER_CONTAINER_KEY,
)!;
const annotationLayerInstance: Ref<PDFJS.AnnotationLayer | null> = inject(
  ANNOTATION_LAYER_INSTANCE_KEY,
)!;

async function render() {
  layer.value!.replaceChildren?.();

  const page = props.page!;
  const viewport = props.viewport!;

  var drawLayer = new PDFJS.DrawLayer({ pageIndex: page?._pageIndex });
  var uiManager = new MinimalUiManager(props.document);

  editor = new PDFJS.AnnotationEditorLayer({
    uiManager: uiManager,
    div: layer.value!,
    viewport: viewport!.clone({ dontFlip: true }),
    enabled: true,
    pageIndex: page!.pageNumber - 1,
    l10n: new GenericL10n("en-US"),
    textLayer: textLayerInstance.value!,
    drawLayer: drawLayer,
    mode: PDFJS.AnnotationEditorType.FREETEXT,
    structTreeLayer: null,
    accessibilityManager: undefined,
    annotationLayer: annotationLayerInstance.value!,
  });

  editor.render({ viewport: viewport!.clone({ dontFlip: true }) });
  editor.enable();

  // const freeText: AnnotationEditorConstructor = uiManager.editorsAvailable.find(
  //   (e: any) => e._type === "freetext",
  // )!;

  // const freetextInstance = new freeText({
  //   uiManager: uiManager,
  //   parent: editor,
  //   id: "vue-pdf-" + editor.getNextId(),
  //   x: 0,
  //   y: 0,
  // });

  // editor.addNewEditor(freetextInstance);
}

watch(
  () => props.viewport,
  () => {
    if (props.page && props.viewport && layer.value) render();
  },
);

onMounted(() => {
  if (props.page && props.viewport && layer.value) render();
});
</script>

<template>
  <div ref="layer" class="annotationEditorLayer" style="z-index: 3" />
  <Teleport to="body">
    <button @click="editor.disable()">groseria</button>
    <button @click="editor.enable()">groseria2</button>
  </Teleport>
</template>

<style></style>
