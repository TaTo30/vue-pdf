<script setup lang="ts">
import { AnnotationEditorParamsType } from "pdfjs-dist";

import { inject, watch } from "vue";
import { HIGHLIGHT_EDITOR_KEY } from "../utils/symbols";

import type { EditorColorPayload, EditorEmitters, EditorEventPayload, EditorFn, EditorParams, HighlightEditorColors } from "../types";

const props = defineProps<{
  color: string; // Note: color value must match with the values defined in HighlightEditorColors
  thickness: number;
  colorOptions?: HighlightEditorColors;
}>();

const emits = defineEmits<{
  (event: "colorChanged", payload: EditorEventPayload & EditorColorPayload): void;
}>();

const manager = inject<EditorFn & EditorParams & EditorEmitters>(HIGHLIGHT_EDITOR_KEY)!;

let updateParamsFn: Function | null = null;

function editorParam(fn: Function) {
  updateParamsFn = fn;
  updateParams();
}

function updateParams() {
  updateParamsFn?.(AnnotationEditorParamsType.HIGHLIGHT_COLOR, props.color, true);
  updateParamsFn?.(AnnotationEditorParamsType.HIGHLIGHT_THICKNESS, props.thickness, true);
}

manager.params = editorParam;
manager.emit = emits;
manager.fn = () => {
  return props.colorOptions;
};

watch(
  () => [props.color, props.thickness],
  () => {
    updateParams();
  },
);

watch(
  () => props.colorOptions,
  () => {
    console.warn(
      "[vue-pdf] Highlight color options can only be set once during initialization.",
    );
  },
);
</script>

<template>
  <!-- This component does not render anything. -->
  <div style="display: none"></div>
</template>
