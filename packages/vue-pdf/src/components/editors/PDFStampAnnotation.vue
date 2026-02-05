<script setup lang="ts">
import { inject } from "vue";
import {
  EditorEmitters,
  EditorEventPayload,
  EditorFn,
  EditorPositionPayload,
  EditorRequest,
  EditorSizePayload,
} from "../types";
import { STAMP_EDITOR_KEY } from "../utils/symbols";

const emits = defineEmits<{
  (event: "altText", editor: any, callback: Function): void;
  (event: "dragging", payload: EditorEventPayload & EditorPositionPayload): void;
  (event: "resizing", payload: EditorEventPayload & EditorSizePayload): void;
}>();

const manager = inject<EditorFn & EditorRequest & EditorEmitters>(
  STAMP_EDITOR_KEY,
)!;

function addStamp(file: File | string | null = null) {
  manager?.fn?.(file);
}

function requestComment(editor: any, callback: Function) {
  emits("altText", editor, (text: string | null) => {
    if (text !== null && text.length > 0) {
      callback(text);
    }
  });
}

manager.request = requestComment;
manager.emit = emits;

defineExpose({
  addStamp,
});
</script>

<template>
  <!-- This component does not render anything. -->
  <div style="display: none"></div>
</template>
