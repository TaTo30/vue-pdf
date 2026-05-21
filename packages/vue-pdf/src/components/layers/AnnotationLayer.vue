<script setup lang="ts">
import * as PDFJS from "pdfjs-dist";
import { inject, onMounted, ref, toRaw, useTemplateRef, watch } from "vue";
import { EVENTS_TO_HANDLER, annotationEventsHandler } from "../utils/annotations";

import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from "pdfjs-dist";
import type { AnnotationLayerParameters, BaseDownloadManager } from "pdfjs-dist/types/src/display/annotation_layer";
import type { LinkService } from "../utils/link_service";

import type { AnnotationEventPayload } from "../types";
import {
  CONTAINER_OBJ_KEY,
  EDITOR_ANNOTATION_LAYER_OBJ_KEY,
} from "../utils/symbols";
import { processLinks } from "../utils/inferred_links";

const props = defineProps<{
  page?: PDFPageProxy;
  viewport?: PageViewport;
  document?: PDFDocumentProxy;
  annotationsFilter?: string[];
  annotationsMap?: object;
  imageResourcesPath?: string;
  hideForms?: boolean;
  enableScripting?: boolean;
  externalLinkEnabled?: boolean;
  intent: string;
  externalLinkEnabled?: boolean;
  externalLinkTarget?: string;
}>();

const emit = defineEmits<{
  (event: "annotation", payload: AnnotationEventPayload): void;
  (event: "annotationLoaded", payload: any[]): void;
}>();

const layer = useTemplateRef<HTMLDivElement>("layer");
const annotations = ref<any[]>();

const containerObj = inject(CONTAINER_OBJ_KEY)! as { linkService: LinkService };
const annotationLayerProvider = inject(EDITOR_ANNOTATION_LAYER_OBJ_KEY)! as {
  promise: Promise<PDFJS.AnnotationLayer | undefined>;
  resolve: (value: PDFJS.AnnotationLayer | undefined) => void;
};

function annotationsEvents(evt: Event) {
  const value = annotationEventsHandler(
    evt,
    props.document!,
    annotations.value!,
  );
  Promise.resolve(value).then((data) => {
    if (data) emit("annotation", data);
  });
}

async function getFieldObjects() {
  const fieldObjects = await toRaw(props.document)?.getFieldObjects();
  return fieldObjects;
}

async function getHasJSActions() {
  const hasJSActions = await toRaw(props.document)?.hasJSActions();
  return hasJSActions;
}

async function getAnnotations() {
  const page = props.page;

  let annotations = await page?.getAnnotations({ intent: props.intent });
  if (props.annotationsFilter) {
    const filters = props.annotationsFilter;
    annotations = annotations!.filter((value) => {
      const subType = value.subtype;
      const fieldType = value.fieldType
        ? `${subType}.${value.fieldType}`
        : null;
      return (
        filters?.includes(subType) ||
        (fieldType !== null && filters?.includes(fieldType))
      );
    });
  }

  return annotations;
}

async function render() {
  layer.value!.replaceChildren?.();
  for (const evtHandler of EVENTS_TO_HANDLER)
    layer.value!.removeEventListener(evtHandler, annotationsEvents);

  const pdf = toRaw(props.document);
  const page = props.page;
  const viewport = props.viewport;

  annotations.value = await getAnnotations();

  // Canvas map for push button widget
  const canvasMap = new Map<string, HTMLCanvasElement>([]);
  for (const anno of annotations.value!) {
    if (
      anno.subtype === "Widget" &&
      anno.fieldType === "Btn" &&
      anno.pushButton
    ) {
      const canvasWidth = anno.rect[2] - anno.rect[0];
      const canvasHeight = anno.rect[3] - anno.rect[1];
      const subCanvas = document.createElement("canvas");
      subCanvas.setAttribute(
        "width",
        (canvasWidth * viewport!.scale).toString(),
      );
      subCanvas.setAttribute(
        "height",
        (canvasHeight * viewport!.scale).toString(),
      );
      canvasMap.set(anno.id, subCanvas);
    }
  }
  const annotationStorage = pdf!.annotationStorage;
  if (props.annotationsMap) {
    for (const [key, value] of Object.entries(props.annotationsMap))
      annotationStorage.setValue(key, value);
  }

  const linkService = containerObj.linkService;
  linkService.setExternalLinkEnabled(props.externalLinkEnabled ?? true);
  linkService.setExternalLinkTarget(props.externalLinkTarget ?? "_blank");

  const layerParameters = {
    accessibilityManager: undefined,
    annotationCanvasMap: canvasMap,
    div: layer.value!,
    page: page!,
    viewport: viewport!.clone({ dontFlip: true }),
    annotationEditorUIManager: null,
    l10n: null,
    annotationStorage,
    linkService,
    commentManager: null,
    structTreeLayer: null,
  };

  const renderParameters: AnnotationLayerParameters = {
    annotations: annotations.value!,
    viewport: viewport!.clone({ dontFlip: true }),
    linkService,
    annotationCanvasMap: canvasMap,
    div: layer.value!,
    annotationStorage,
    renderForms: !props.hideForms,
    page: page!,
    enableScripting: false,
    hasJSActions: await getHasJSActions(),
    fieldObjects: await getFieldObjects(),
    downloadManager: null as unknown as BaseDownloadManager,
    imageResourcesPath: props.imageResourcesPath,
  };

  const instance = new PDFJS.AnnotationLayer(layerParameters);
  const task = instance.render(renderParameters);
  task.then(async () => {
    annotationLayerProvider.resolve(instance);

    const inferredLinks = await processLinks(
      page!,
      layer.value!,
      viewport!.clone(),
    );

    instance.addLinkAnnotations(inferredLinks);

    emit("annotationLoaded", (await getAnnotations())!);
  });

  for (const evtHandler of EVENTS_TO_HANDLER)
    layer.value!.addEventListener(evtHandler, annotationsEvents);
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
  <div ref="layer" class="annotationLayer" style="display: block" />
</template>
