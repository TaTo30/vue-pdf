<script setup lang="ts">
import * as PDFJS from "pdfjs-dist";
import { inject, onMounted, provide, Ref, ref, watch } from "vue";

import type { PDFPageProxy, PageViewport } from "pdfjs-dist";
// import { GenericL10n } from "../utils/l10n";

import MinimalUiManager from "../utils/manager";
import {
  ANNOTATION_EDITORS_PARAMS_KEY,
  COMMENT_EDITOR_KEY,
  EDITOR_ANNOTATION_LAYER_OBJ_KEY,
  EDITOR_TEXT_LAYER_OBJ_KEY,
  HIGHLIGHT_EDITOR_COLORS_KEY,
} from "../utils/symbols";

import type { CommentEditorOpts, HighlightEditorColors } from "../types";
import { IL10n } from "pdfjs-dist/types/web/interfaces";

const DEFAULT_HIGHLIGHT_COLORS: HighlightEditorColors = {
  yellow: ["#FFEB3B", "#FFFFCC"],
  green: ["#8BC34A", "#53FFBC"],
  pink: ["#FFCBE6", "#F6B8FF"],
  red: ["#F44336", "#FF4F5F"],
  blue: ["#2196F3", "#80EBFF"],
};

const props = defineProps<{
  page?: PDFPageProxy;
  viewport?: PageViewport;
  document?: PDFJS.PDFDocumentProxy;
  intent: string;
  editorType: number;
}>();

const layer = ref<HTMLDivElement>();

let uiManager: MinimalUiManager | null = null;
let editor: PDFJS.AnnotationEditorLayer | null = null;

const editorsParams: Function[] = [];
const getHighlightColors: { fn: Function | null } = { fn: null };
const commentPopup: CommentEditorOpts = {
  fn: null,
  request: null,
};

provide(ANNOTATION_EDITORS_PARAMS_KEY, editorsParams);
provide(HIGHLIGHT_EDITOR_COLORS_KEY, getHighlightColors);
provide(COMMENT_EDITOR_KEY, commentPopup);

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
    uiManager = new MinimalUiManager(
      props.document,
      commentPopup,
      getHighlightColors.fn?.() ?? DEFAULT_HIGHLIGHT_COLORS,
      editorsParams,
    );
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
    uiManager.onRotationChanging({ pagesRotation: clonedViewport.rotation });
    uiManager.onScaleChanging({ scale: clonedViewport.scale });
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
    l10n: null as any as IL10n,
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
    PDFJS.AnnotationEditorType.INK,
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
  <div ref="layer" class="annotationEditorLayer" id="annotationEditorLayer" />
  <slot></slot>
</template>

<style>
:root {
  --comment-edit-button-icon: url("data:image/svg+xml,%3csvg%20width='16'%20height='16'%20viewBox='0%200%2016%2016'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%3e%3cpath%20d='M10.75%207H12.25V5.5H10.75V7Z'%20fill='black'/%3e%3cpath%20d='M7.5%207H9V5.5H7.5V7Z'%20fill='black'/%3e%3cpath%20d='M4.25%207H5.75V5.5H4.25V7Z'%20fill='black'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M2%200C0.895786%200%200%200.895786%200%202V10.5C0%2011.6042%200.895786%2012.5%202%2012.5H3V15.25C3%2015.5405%203.16778%2015.805%203.43066%2015.9287C3.6937%2016.0523%204.00473%2016.0126%204.22852%2015.8271L8.27051%2012.4775L13.9941%2012.4961C15.1007%2012.4991%2015.9999%2011.6033%2016%2010.4961V2C16%200.895786%2015.1042%200%2014%200H2ZM14%201.5C14.2758%201.5%2014.5%201.72421%2014.5%202V10.4961C14.4999%2010.7727%2014.2753%2010.9969%2013.998%2010.9961L8.00195%2010.9775L7.87207%2010.9893C7.74389%2011.0115%207.62281%2011.0664%207.52148%2011.1504L4.5%2013.6543V11.75C4.5%2011.3358%204.16421%2011%203.75%2011H2C1.72421%2011%201.5%2010.7758%201.5%2010.5V2C1.5%201.72421%201.72421%201.5%202%201.5H14Z'%20fill='black'/%3e%3c/g%3e%3c/svg%3e");
}
</style>
