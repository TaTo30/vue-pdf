<script setup lang="ts">
import { AnnotationEditorParamsType } from "pdfjs-dist";

import { inject, watch } from "vue";
import { ANNOTATION_EDITORS_PARAMS_KEY } from "../utils/symbols";

const props = defineProps<{
  color: string;
  thickness: number;
  opacity: number;
}>();

const params = inject<Function[]>(ANNOTATION_EDITORS_PARAMS_KEY);

let updateParamsFn: Function | null = null;

function editorParam(fn: Function) {
  updateParamsFn = fn;
  updateParams();
}

function updateParams() {
  updateParamsFn?.(AnnotationEditorParamsType.INK_COLOR, props.color);
  updateParamsFn?.(AnnotationEditorParamsType.INK_THICKNESS, props.thickness);
  updateParamsFn?.(AnnotationEditorParamsType.INK_OPACITY, props.opacity);
}

params?.push(editorParam);

watch(
  () => [props.color, props.thickness, props.opacity],
  () => {
    updateParams();
  },
);
</script>

<template>
  <!-- This component does not render anything. -->
  <div style="display: none"></div>
</template>
