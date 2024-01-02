<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import { withBase } from 'vitepress/client'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF({
  url: withBase('/example_xfa.pdf'),
  enableXfa: true,
})
</script>

<template>
  <div class="vue-pdf-container">
    <VuePDF :pdf="pdf" />
  </div>
</template>
