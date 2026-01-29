<script setup lang="ts">
import { AnnotationEditorParamsType } from "pdfjs-dist";

import { inject, watch } from "vue";
import { ANNOTATION_EDITORS_PARAMS_KEY } from "../utils/symbols";

const props = defineProps<{
  color: string;
  fontSize: number;
}>();

const params = inject<Function[]>(ANNOTATION_EDITORS_PARAMS_KEY);

let updateParamsFn: Function | null = null;

function editorParam(fn: Function) {
  updateParamsFn = fn;
  updateParamsFn(AnnotationEditorParamsType.FREETEXT_COLOR, props.color);
  updateParamsFn(AnnotationEditorParamsType.FREETEXT_SIZE, props.fontSize);
}

params?.push(editorParam);

watch(
  () => [props.color, props.fontSize],
  () => {
    updateParamsFn?.(AnnotationEditorParamsType.FREETEXT_COLOR, props.color);
    updateParamsFn?.(AnnotationEditorParamsType.FREETEXT_SIZE, props.fontSize);
  },
);
</script>
