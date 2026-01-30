<script setup lang="ts">
import * as PDFJS from "pdfjs-dist";
import { inject, onMounted, provide, Ref, ref, watch } from "vue";

import type { PDFPageProxy, PageViewport } from "pdfjs-dist";
import { GenericL10n } from "../utils/l10n";

import MinimalUiManager from "../utils/manager";
import {
  ANNOTATION_EDITORS_PARAMS_KEY,
  EDITOR_ANNOTATION_LAYER_OBJ_KEY,
  EDITOR_TEXT_LAYER_OBJ_KEY,
} from "../utils/symbols";

const props = defineProps<{
  page?: PDFPageProxy;
  viewport?: PageViewport;
  document?: PDFJS.PDFDocumentProxy;
  intent: string;
  editorType: number;
}>();

const layer = ref<HTMLDivElement>();

let uiManager: MinimalUiManager | null = null;
let editor: any = null;

const editorsParams: Function[] = [];
provide(ANNOTATION_EDITORS_PARAMS_KEY, editorsParams);

const textLayerProvider = inject(EDITOR_TEXT_LAYER_OBJ_KEY)! as {
  container: Ref<HTMLDivElement | undefined>;
  promise: Promise<HTMLDivElement | undefined>;
  resolve: (value: HTMLDivElement | undefined) => void;
};
const annotationLayerProvider = inject(EDITOR_ANNOTATION_LAYER_OBJ_KEY)! as {
  instance: Ref<PDFJS.AnnotationLayer | undefined>;
  promise: Promise<PDFJS.AnnotationLayer | undefined>;
  resolve: (value: PDFJS.AnnotationLayer | undefined) => void;
};

async function render() {
  const page = props.page!;
  const viewport = props.viewport!;

  if (!uiManager) {
    uiManager = new MinimalUiManager(props.document, editorsParams);
  }

  // Wait for both text layer and annotation layer dependencies to resolve
  const [textLayerElement, annotationLayerInstance] = await Promise.all([
    textLayerProvider.promise,
    annotationLayerProvider.promise,
  ]);

  const clonedViewport = viewport.clone({ dontFlip: true });
  if (editor) {
    editor.pause(true);
    editor.update({ viewport: clonedViewport });
    editor.pause(false);
    uiManager.updateMode(props.editorType);
    return;
  }

  const drawLayer = new PDFJS.DrawLayer({ pageIndex: page?._pageIndex });
  const parentdrawer = document.getElementById("drawlayer");
  drawLayer.setParent(parentdrawer!);

  editor = new PDFJS.AnnotationEditorLayer({
    uiManager: uiManager,
    div: layer.value!,
    viewport: viewport!.clone({ dontFlip: true }),
    enabled: true,
    pageIndex: page!.pageNumber - 1,
    l10n: new GenericL10n("en-US"),
    textLayer: textLayerElement
      ? ({ div: textLayerElement } as any as HTMLDivElement)
      : undefined, // <-- Type casting to satisfy typescript bllsht :)
    drawLayer: drawLayer,
    mode: PDFJS.AnnotationEditorType.NONE,
    structTreeLayer: null,
    accessibilityManager: undefined,
    annotationLayer: annotationLayerInstance,
  });

  editor.render({ viewport: viewport!.clone({ dontFlip: true }) });
  editor.enable();

  uiManager.updateMode(props.editorType);
}

function checkEditorType() {
  const whiteList = [
    PDFJS.AnnotationEditorType.FREETEXT,
    PDFJS.AnnotationEditorType.HIGHLIGHT,
    PDFJS.AnnotationEditorType.NONE,
    PDFJS.AnnotationEditorType.DISABLE,
  ];

  if (!whiteList.includes(props.editorType)) {
    console.warn(`[vue-pdf] Unsupported editor type: ${props.editorType}.`);
  } else {
    render();
  }
}

watch(
  () => [props.viewport, props.editorType],
  () => {
    if (props.page && props.viewport && layer.value) checkEditorType();
  },
);

onMounted(() => {
  if (props.page && props.viewport && layer.value) checkEditorType();
});
</script>

<template>
  <div ref="layer" class="annotationEditorLayer" />
  <slot></slot>
</template>
