<!-- eslint-disable unused-imports/no-unused-imports -->
<!-- Use this component to play with the main components -->
<script setup lang="ts">
import { ref } from "vue";
import pdf14 from "@samples/issue126.pdf";
import { VuePDF, usePDF, PDFFreeTextAnnotation } from "@tato30/vue-pdf";

const { pdf, download } = usePDF(pdf14);

const color = ref<"blue" | "red">("blue");
const toggleColor = () => {
  color.value = color.value === "blue" ? "red" : "blue";
};
</script>

<template>
  <button @click="download()">descargar</button>
  <button @click="toggleColor()">color: {{ color }}</button>
  <div style="display: flex; align-items: center">
    <VuePDF :pdf="pdf" annotation-layer>
      <template #editors>
        <PDFFreeTextAnnotation :color="color" :fontSize="20" />
      </template>
    </VuePDF>
  </div>
</template>
