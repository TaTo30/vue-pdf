<script setup lang="ts">
import { AnnotationEditorParamsType } from "pdfjs-dist";

import { inject, watch } from "vue";
import {
  ANNOTATION_EDITORS_PARAMS_KEY,
  HIGHLIGHT_EDITOR_COLORS_KEY,
} from "../utils/symbols";

import type { HighlightEditorColors } from "../types";

const props = defineProps<{
  color: string;
  thickness: number;
  colorOptions?: HighlightEditorColors;
}>();

const params = inject<Function[]>(ANNOTATION_EDITORS_PARAMS_KEY);
const highlightColors = inject<{ fn: Function | null }>(
  HIGHLIGHT_EDITOR_COLORS_KEY,
)!;

let updateParamsFn: Function | null = null;

function editorParam(fn: Function) {
  updateParamsFn = fn;
  updateParams();
}

function updateParams() {
  updateParamsFn?.(AnnotationEditorParamsType.HIGHLIGHT_COLOR, props.color);
  updateParamsFn?.(
    AnnotationEditorParamsType.HIGHLIGHT_THICKNESS,
    props.thickness,
  );
}

params?.push(editorParam);
highlightColors.fn = () => {
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
