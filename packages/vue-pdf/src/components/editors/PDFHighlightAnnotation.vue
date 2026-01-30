<script setup lang="ts">
import { AnnotationEditorParamsType } from "pdfjs-dist";

import { inject, watch } from "vue";
import { ANNOTATION_EDITORS_PARAMS_KEY } from "../utils/symbols";

const props = defineProps<{
  color: string;
  thickness: number;
}>();

const params = inject<Function[]>(ANNOTATION_EDITORS_PARAMS_KEY);

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

watch(
  () => [props.color, props.thickness],
  () => {
    updateParams();
  },
);
</script>
