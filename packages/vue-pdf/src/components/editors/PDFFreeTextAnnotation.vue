<script setup lang="ts">
import { AnnotationEditorParamsType } from "pdfjs-dist";

import { inject, watch } from "vue";
import { FREE_TEXT_EDITOR_KEY } from "../utils/symbols";
import {
  EditorColorPayload,
  EditorEmitters,
  EditorEventPayload,
  EditorParams,
  EditorPositionPayload,
} from "../types";

const props = defineProps<{
  color: string;
  fontSize: number;
}>();

const emit = defineEmits<{
  (event: "dragging", payload: EditorEventPayload & EditorPositionPayload): void;
  (event: "colorChanged", payload: EditorEventPayload & EditorColorPayload): void;
}>();

const manager = inject<EditorParams & EditorEmitters>(FREE_TEXT_EDITOR_KEY)!;

let updateParamsFn: Function | null = null;

function editorParam(fn: Function) {
  updateParamsFn = fn;
  updateParams();
}

function updateParams() {
  updateParamsFn?.(AnnotationEditorParamsType.FREETEXT_COLOR, props.color, true);
  updateParamsFn?.(AnnotationEditorParamsType.FREETEXT_SIZE, props.fontSize, true);
}

manager.params = editorParam;
manager.emit = emit;

watch(
  () => [props.color, props.fontSize],
  () => {
    updateParams();
  },
);
</script>

<template>
  <!-- This component does not render anything. -->
  <div style="display: none"></div>
</template>
