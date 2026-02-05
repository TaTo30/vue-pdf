<script setup lang="ts">
import { AnnotationEditorParamsType } from "pdfjs-dist";

import { inject, watch } from "vue";
import { INK_EDITOR_KEY } from "../utils/symbols";
import {
  EditorColorPayload,
  EditorEmitters,
  EditorEventPayload,
  EditorParams,
  EditorPositionPayload,
  EditorSizePayload,
} from "../types";

const props = defineProps<{
  color: string;
  thickness: number;
  opacity: number;
}>();

const emits = defineEmits<{
  (event: "dragging", payload: EditorEventPayload & EditorPositionPayload): void;
  (event: "resizing", payload: EditorEventPayload & EditorSizePayload): void;
  (event: "colorChanged", payload: EditorEventPayload & EditorColorPayload): void;
}>();

const manager = inject<EditorParams & EditorEmitters>(INK_EDITOR_KEY)!;

let updateParamsFn: Function | null = null;

function editorParam(fn: Function) {
  updateParamsFn = fn;
  updateParams();
}

function updateParams() {
  updateParamsFn?.(AnnotationEditorParamsType.INK_COLOR, props.color, true);
  updateParamsFn?.(AnnotationEditorParamsType.INK_THICKNESS, props.thickness, true);
  updateParamsFn?.(AnnotationEditorParamsType.INK_OPACITY, props.opacity, true);
}

manager.params = editorParam;
manager.emit = emits;

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
