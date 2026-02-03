<!-- eslint-disable no-case-declarations -->
<script setup lang="ts">
import * as PDFJS from "pdfjs-dist";
import {
  computed,
  onMounted,
  onUnmounted,
  provide,
  ref,
  toRaw,
  useTemplateRef,
  watch,
} from "vue";

import "pdfjs-dist/web/pdf_viewer.css";

import type {
  PDFDocumentLoadingTask,
  PDFPageProxy,
  PageViewport,
  RenderTask,
} from "pdfjs-dist";
import type {
  GetViewportParameters,
  PDFDocumentProxy,
  RenderParameters,
} from "pdfjs-dist/types/src/display/api";
import type {
  AnnotationEventPayload,
  HighlightEventPayload,
  HighlightOptions,
  LoadedEventPayload,
  TextLayerLoadedEventPayload,
  WatermarkOptions,
} from "./types";

import AnnotationLayer from "./layers/AnnotationLayer.vue";
import AnnotationEditorLayer from "./layers/AnnotationEditorLayer.vue";
import TextLayer from "./layers/TextLayer.vue";
import XFALayer from "./layers/XFALayer.vue";
import {
  CONTAINER_OBJ_KEY,
  EDITOR_ANNOTATION_LAYER_OBJ_KEY,
  EDITOR_TEXT_LAYER_OBJ_KEY,
} from "./utils/symbols";

interface InternalProps {
  page: PDFPageProxy | undefined;
  document: PDFDocumentProxy | undefined;
  viewport: PageViewport | undefined;
}

const props = withDefaults(
  defineProps<{
    pdf?: PDFDocumentLoadingTask;
    page?: number;
    scale?: number;
    rotation?: number;
    fitParent?: boolean;
    width?: number;
    height?: number;
    textLayer?: boolean;
    autoDestroy?: boolean;
    imageResourcesPath?: string;
    hideForms?: boolean;
    intent?: string;
    annotationLayer?: boolean;
    annotationsFilter?: string[];
    annotationsMap?: object;
    watermarkText?: string;
    watermarkOptions?: WatermarkOptions;
    highlightText?: string | string[];
    highlightOptions?: HighlightOptions;
    highlightPages?: number[];
    // TODO: this prop is currently not working properly when used reactively
    editorLayer?: boolean;
    editorType?: number;
  }>(),
  {
    page: 1,
    scale: 1,
    editorType: 0,
    intent: "display",
    autoDestroy: false,
  },
);

const emit = defineEmits<{
  (event: "annotation", payload: AnnotationEventPayload): void;
  (event: "highlight", payload: HighlightEventPayload): void;
  (event: "loaded", payload: LoadedEventPayload): void;
  (event: "textLoaded", payload: TextLayerLoadedEventPayload): void;
  (event: "annotationLoaded", payload: any[]): void;
  (event: "xfaLoaded"): void;
}>();

// Template Refs
const container = useTemplateRef("container");
const canvasWrapper = useTemplateRef("canvasWrapper");
const loadingLayer = useTemplateRef("loadingLayer");

const loading = ref(false);
let renderTask: RenderTask;

const internalProps = computed(() => {
  return {
    viewport: undefined,
    document: undefined,
    page: undefined,
  } as InternalProps;
});
const alayerProps = computed(() => {
  return {
    annotationsMap: props.annotationsMap,
    annotationsFilter: props.annotationsFilter,
    imageResourcesPath: props.imageResourcesPath,
    hideForms: props.hideForms,
    intent: props.intent,
  };
});
const tlayerProps = computed(() => {
  return {
    highlightText: props.highlightText,
    highlightOptions: props.highlightOptions,
    highlightPages: props.highlightPages,
  };
});
const aelayerProps = computed(() => {
  return {
    editorLayer: props.editorLayer,
    editorType: props.editorType,
    intent: props.intent,
  };
});

// Promise resolvers for async dependency management
let alayerResolver: (value: PDFJS.AnnotationLayer | undefined) => void;
let tlayerResolver: (value: HTMLDivElement | undefined) => void;

provide(EDITOR_ANNOTATION_LAYER_OBJ_KEY, {
  promise: new Promise<PDFJS.AnnotationLayer | undefined>((resolve) => {
    alayerResolver = resolve;
  }),
  resolve: (value: PDFJS.AnnotationLayer | undefined) => alayerResolver(value),
});
provide(EDITOR_TEXT_LAYER_OBJ_KEY, {
  promise: new Promise<HTMLDivElement | undefined>((resolve) => {
    tlayerResolver = resolve;
  }),
  resolve: (value: HTMLDivElement | undefined) => tlayerResolver(value),
});
provide(CONTAINER_OBJ_KEY, {
  wrapper: canvasWrapper,
  container: container,
  uiManager: null,
});

function getWatermarkOptionsWithDefaults(): WatermarkOptions {
  return Object.assign(
    {},
    {
      columns: 4,
      rows: 4,
      rotation: 45,
      fontSize: 18,
      color: "rgba(211, 210, 211, 0.4)",
    },
    props.watermarkOptions,
  );
}

function getRotation(rotation: number): number {
  if (!(typeof rotation === "number" && rotation % 90 === 0)) return 0;
  const factor = rotation / 90;
  if (factor > 4) return getRotation(rotation - 360);
  else if (factor < 0) return getRotation(rotation + 360);
  return rotation;
}

function getScale(page: PDFPageProxy): number {
  let fscale = props.scale;
  if (props.fitParent) {
    const parentWidth: number = (
      canvasWrapper.value!.parentNode! as HTMLElement
    ).clientWidth;
    const scale1Width = page.getViewport({ scale: 1 }).width;
    fscale = parentWidth / scale1Width;
  } else if (props.width) {
    const scale1Width = page.getViewport({ scale: 1 }).width;
    fscale = props.width / scale1Width;
  } else if (props.height) {
    const scale1Height = page.getViewport({ scale: 1 }).height;
    fscale = props.height / scale1Height;
  }
  return fscale;
}

function paintWatermark(zoomRatio = 1.0) {
  if (!props.watermarkText) return;

  const canvas = getCurrentCanvas();
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const mergeOptions = getWatermarkOptionsWithDefaults();

  const text = props.watermarkText;
  const columns = mergeOptions.columns!;
  const rows = mergeOptions.rows!;
  const numWatermarks = columns * rows;
  const rotation = mergeOptions.rotation!;
  const pixels = mergeOptions.fontSize! * zoomRatio;
  ctx.font = `${pixels}px Trebuchet MS`;
  ctx.fillStyle = mergeOptions.color!;

  for (let i = 0; i < numWatermarks; i++) {
    const x =
      (i % columns) * (canvas.width / columns) + canvas.width / (columns * 2);
    const y =
      Math.floor(i / columns) * (canvas.height / rows) +
      canvas.height / (rows * 2);

    const textWidth = ctx.measureText(text).width;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-rotation * (Math.PI / 180));
    ctx.fillText(text, -textWidth / 2, pixels / 2);
    ctx.restore();
  }
}

function getCurrentCanvas(): HTMLCanvasElement | null {
  let oldCanvas = null;
  canvasWrapper.value?.childNodes.forEach((el) => {
    if ((el as HTMLElement).tagName === "CANVAS") oldCanvas = el;
  });
  return oldCanvas;
}

function setupCanvas(viewport: PageViewport): HTMLCanvasElement {
  let canvas;
  const currentCanvas = getCurrentCanvas()!;
  if (currentCanvas && currentCanvas?.getAttribute("role") === "main") {
    canvas = currentCanvas;
  } else {
    canvas = document.createElement("canvas");
    canvas.style.display = "block";
    canvas.setAttribute("dir", "ltr");
  }

  const outputScale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);

  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.height = `${Math.floor(viewport.height)}px`;

  container.value?.style.setProperty("--scale-factor", `${viewport.scale}`);
  container.value?.style.setProperty("--user-unit", `${viewport.userUnit}`);

  // TODO: this attributes should be calculated according to device pixel ratio and scale, 1px works well for several cases
  // but may not be accurate in some specific cases
  container.value?.style.setProperty("--scale-round-y", `1px`);
  container.value?.style.setProperty("--scale-round-x", `1px`);
  container.value?.style.setProperty(
    "--total-scale-factor",
    "calc(var(--scale-factor) * var(--user-unit))",
  );

  // Also setting dimension properties for load layer
  loadingLayer.value!.style.width = `${Math.floor(viewport.width)}px`;
  loadingLayer.value!.style.height = `${Math.floor(viewport.height)}px`;
  loadingLayer.value!.style.top = "0";
  loadingLayer.value!.style.left = "0";
  loading.value = true;
  return canvas;
}

function cancelRender() {
  if (renderTask) renderTask.cancel();
}

function renderPage(pageNum: number) {
  toRaw(internalProps.value.document)
    ?.getPage(pageNum)
    .then((page) => {
      cancelRender();

      const defaultViewport = page.getViewport();
      const viewportParams: GetViewportParameters = {
        scale: getScale(page),
        rotation: getRotation((props.rotation || 0) + defaultViewport.rotation),
      };
      const viewport = page.getViewport(viewportParams);

      const oldCanvas = getCurrentCanvas();
      const canvas = setupCanvas(viewport);

      const outputScale = window.devicePixelRatio || 1;
      const transform =
        outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

      // Render PDF page into canvas context
      const renderContext: RenderParameters = {
        canvas: canvas,
        viewport,
        annotationMode: props.hideForms
          ? PDFJS.AnnotationMode.ENABLE
          : PDFJS.AnnotationMode.ENABLE_FORMS,
        transform,
        intent: props.intent,
      };

      if (canvas?.getAttribute("role") !== "main") {
        if (oldCanvas) canvasWrapper.value?.replaceChild(canvas, oldCanvas);
      } else {
        canvas.removeAttribute("role");
      }

      internalProps.value.page = page;
      internalProps.value.viewport = viewport;
      renderTask = page.render(renderContext);
      renderTask.promise
        .then(() => {
          loading.value = false;
          paintWatermark(viewport.scale);
          emit("loaded", internalProps.value.viewport!);
        })
        .catch(() => {
          // render task cancelled
        });
    });
}

function initDoc(proxy: PDFDocumentLoadingTask) {
  proxy.promise.then(async (document) => {
    internalProps.value.document = document;
    renderPage(props.page);
  });
}

watch(
  () => props.pdf,
  (pdf, oldPdf) => {
    cancelRender();
    if (oldPdf && oldPdf !== pdf && !props.autoDestroy) {
      oldPdf.destroy();
    }
    // For any changes on pdf, reinicialize all
    if (pdf !== undefined) initDoc(pdf);
  },
);

watch(
  () => [
    props.scale,
    props.width,
    props.height,
    props.rotation,
    props.page,
    props.hideForms,
    props.intent,
  ],
  () => {
    // Props that should dispatch an render task
    renderPage(props.page);
  },
);

onMounted(() => {
  if (props.pdf !== undefined) initDoc(props.pdf);
});

onUnmounted(() => {
  // Abort all network process and terminates the worker
  if (props.autoDestroy) props.pdf?.destroy();
});

// Exposed method
function destroy() {
  props.pdf?.destroy();
}

function reload() {
  renderPage(props.page);
}

function cancel() {
  cancelRender();
}

defineExpose({
  reload,
  cancel,
  destroy,
});
</script>

<template>
  <div
    ref="container"
    class="page"
    style="position: relative; background-clip: content-box"
  >
    <div ref="canvasWrapper" id="drawlayer" class="canvasWrapper">
      <canvas dir="ltr" role="main" />
    </div>
    <TextLayer
      v-if="textLayer"
      v-bind="{ ...internalProps, ...tlayerProps }"
      @highlight="emit('highlight', $event)"
      @text-loaded="emit('textLoaded', $event)"
    />
    <AnnotationLayer
      v-if="annotationLayer"
      v-bind="{ ...internalProps, ...alayerProps }"
      @annotation="emit('annotation', $event)"
      @annotation-loaded="emit('annotationLoaded', $event)"
    />
    <AnnotationEditorLayer v-bind="{ ...internalProps, ...aelayerProps }">
      <slot name="editors" />
    </AnnotationEditorLayer>
    <XFALayer v-bind="{ ...internalProps }" @xfa-loaded="emit('xfaLoaded')" />
    <div v-show="loading" ref="loadingLayer" style="position: absolute">
      <slot />
    </div>
    <slot
      name="overlay"
      :width="internalProps.viewport?.width"
      :height="internalProps.viewport?.height"
    />
  </div>
</template>
