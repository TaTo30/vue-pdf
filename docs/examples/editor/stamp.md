# Stamp Editor

```vue
<script setup>
import { useTemplateRef } from 'vue'
import { VuePDF, usePDF, PDFStampAnnotation } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF('https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf')

const stamp = useTemplateRef('stamp')

function addStamp() {
  stamp.value?.addStamp()
}

function onAltText(editor, callback) {
  const text = prompt('Enter alt text for the image:')
  callback(text)
}
</script>

<template>
  <div>
    <div>
      <button @click="addStamp">Add Stamp</button>
    </div>
    <VuePDF :pdf="pdf" text-layer annotation-layer editor-layer :editor-type="13">
      <template #editors>
        <PDFStampAnnotation ref="stamp" @alt-text="onAltText" />
      </template>
    </VuePDF>
  </div>
</template>
```
<ClientOnly>
  <EditorStamp />
</ClientOnly>
