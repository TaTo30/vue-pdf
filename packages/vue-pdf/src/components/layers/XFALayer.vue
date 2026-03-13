<script setup lang="ts">
import * as PDFJS from "pdfjs-dist";
import { inject, onMounted, toRaw, useTemplateRef, watch } from "vue";

import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from "pdfjs-dist";
import type { XfaLayerParameters } from "pdfjs-dist/types/src/display/xfa_layer";
import type { LinkService } from "../utils/link_service";
import { CONTAINER_OBJ_KEY } from "../utils/symbols";

const props = defineProps<{
  page?: PDFPageProxy;
  document?: PDFDocumentProxy;
  viewport?: PageViewport;
}>();

const emit = defineEmits<{
  (event: "xfaLoaded"): void;
}>();

const layer = useTemplateRef<HTMLDivElement>("layer");

const globalState = inject(CONTAINER_OBJ_KEY)! as {
  rootEmit: Function;
  linkService: LinkService;
};

async function render() {
  layer.value!.replaceChildren?.();

  const pdf = toRaw(props.document);
  const page = props.page;
  const viewport = props.viewport;

  if (pdf!.isPureXfa) {
    const xfaHTML = await page!.getXfa();
    const parameters: XfaLayerParameters = {
      div: layer.value!,
      viewport: viewport!.clone({ dontFlip: true }),
      linkService: globalState.linkService,
      annotationStorage: pdf?.annotationStorage,
      xfaHtml: xfaHTML!,
    };
    PDFJS.XfaLayer.render(parameters);
    emit("xfaLoaded");
  }
}

watch(
  () => props.viewport,
  (_) => {
    if (props.page && props.viewport && layer.value) render();
  },
);

onMounted(() => {
  if (props.page && props.viewport && layer.value) render();
});
</script>

<template>
  <div ref="layer" style="display: block" />
</template>
