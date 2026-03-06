<!-- eslint-disable unused-imports/no-unused-imports -->
<!-- Use this component to play with the main components -->
<script setup lang="ts">
import { VuePDF, usePDF } from "@tato30/vue-pdf";

const { pdf } = usePDF(
  "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
);
</script>

<template>
  <VuePDF :pdf="pdf" annotation-layer text-layer> </VuePDF>
</template>
