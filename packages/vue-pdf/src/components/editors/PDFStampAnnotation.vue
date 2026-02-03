<script setup lang="ts">
import { inject } from "vue";
import { EditorFn, EditorRequest } from "../types";
import { STAMP_EDITOR_KEY } from "../utils/symbols";

const emits = defineEmits<{
  (event: "altText", payload: Function): void;
}>();

const addStampFn = inject<EditorFn & EditorRequest>(STAMP_EDITOR_KEY)!;

function addStamp(file: File | string | null = null) {
  addStampFn?.fn?.(file);
}

function requestComment(callback: Function) {
  emits("altText", (text: string | null) => {
    if (text !== null && text.length > 0) {
      callback(text);
    }
  });
}

addStampFn.request = requestComment;

defineExpose({
  addStamp,
});
</script>

<template>
  <!-- This component does not render anything. -->
  <div style="display: none"></div>
</template>
