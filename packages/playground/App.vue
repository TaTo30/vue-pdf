<!-- eslint-disable unused-imports/no-unused-imports -->
<!-- Use this component to play with the main components -->
<script setup lang="ts">
import pdf14 from "@samples/issue126.pdf";
import { VuePDF, usePDF } from "@tato30/vue-pdf";

const { pdf, download } = usePDF(pdf14);
</script>

<template>
  <button @click="download()">descargar</button>
  <div style="display: flex; align-items: center">
    <VuePDF :pdf="pdf" annotation-layer />
  </div>
</template>
