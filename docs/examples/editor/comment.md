# Comment Editor

```vue
<script setup>
import { ref } from 'vue'
import {
  VuePDF,
  usePDF,
  PDFHighlightAnnotation,
  PDFCommentAnnotation,
} from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF('https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf')

const colorOptions = ['#FFEB3B', '#8BC34A', '#FFCBE6', '#F44336', '#2196F3']
const color = ref('#FFEB3B')
const thickness = ref(12)

function onComment(editor, callback) {
  const text = prompt('Enter comment:')
  callback(text)
}

function onRemoved(editor) {
  console.log('Comment removed from editor:', editor)
}
</script>

<template>
  <div>
    <div>
      <select v-model="color">
        <option v-for="c in colorOptions" :key="c" :value="c">{{ c }}</option>
      </select>
      <input v-model.number="thickness" type="range" min="1" max="40" />
      {{ thickness }}
    </div>
    <VuePDF :pdf="pdf" text-layer annotation-layer editor-layer :editor-type="9">
      <template #editors>
        <PDFHighlightAnnotation :color="color" :thickness="thickness" />
        <PDFCommentAnnotation @comment="onComment" @removed="onRemoved" />
      </template>
    </VuePDF>
  </div>
</template>
```
<ClientOnly>
  <EditorComment />
</ClientOnly>

::: tip
Editor events are being logged to the browser console. Open DevTools to see them.
:::
