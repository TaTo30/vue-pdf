---
outline: deep
---

# Editor

::: warning Beta Feature
The annotation editor is currently in beta as this is the first version of the feature. Some functionality may not work as expected or could have limitations. Please report any issues you encounter.
:::

VuePDF supports annotation editing through the **Annotation Editor Layer**, allowing users to create and manage annotations directly on PDF pages. This feature is powered by `pdf.js` built-in annotation editor capabilities.

## Setup

To enable annotation editing, you need to use the `editor-layer` and `editor-type` props on the `VuePDF` component, along with the editor sub-components placed inside the `editors` slot.

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF('document.pdf')
const editorType = ref(0)
</script>

<template>
  <VuePDF
    :pdf="pdf"
    text-layer
    annotation-layer
    editor-layer
    :editor-type="editorType"
  >
    <template #editors>
      <!-- Place editor components here -->
    </template>
  </VuePDF>
</template>
```

> [!IMPORTANT]
> For editor layer works properly both `annotation-layer` and `text-layer` must be always in `true`, switching those props two `false` will break editor behavior. 


## Props

### editor-layer

Type: `boolean` <br />
Required: `false` <br />
Default: `false`

Enables the annotation editor layer.

```vue
<VuePDF :pdf="pdf" editor-layer />
```

### editor-type

Type: `number` <br />
Required: `false` <br />
Default: `0`

Sets the active editor mode. The following values are available:

| Value | Mode      | Description                                     |
| ----- | --------- | ----------------------------------------------- |
| `0`   | NONE      | No editor active, annotations are still visible |
| `3`   | FREETEXT  | Free text annotation editor                     |
| `9`   | HIGHLIGHT | Highlight annotation editor                     |
| `13`  | STAMP     | Stamp/image annotation editor                   |
| `15`  | INK       | Ink/drawing annotation editor                   |

```vue
<VuePDF :pdf="pdf" editor-layer :editor-type="3" />
```

::: tip
You can import the editor type constants from `pdfjs-dist`:
```js
import { AnnotationEditorType } from 'pdfjs-dist'

// AnnotationEditorType.NONE      = 0
// AnnotationEditorType.FREETEXT  = 3
// AnnotationEditorType.HIGHLIGHT = 9
// AnnotationEditorType.STAMP     = 13
// AnnotationEditorType.INK       = 15
```
:::

## Events

### editorLoaded

```vue
<VuePDF :pdf="pdf" editor-layer @editor-loaded="onEditorLoaded" />
```

Emitted when the editor layer has finished rendering.

### editorAdded

```vue
<VuePDF :pdf="pdf" editor-layer @editor-added="onEditorAdded" />
```

Emitted when a new editor annotation is added. The payload contains the editor instance.

Payload:
```ts
{
  editor: AnnotationEditor
}
```

### editorRemoved

```vue
<VuePDF :pdf="pdf" editor-layer @editor-removed="onEditorRemoved" />
```

Emitted when an editor annotation is removed. The payload contains the editor instance.

Payload:
```ts
{
  editor: AnnotationEditor
}
```

### editorSelected

```vue
<VuePDF :pdf="pdf" editor-layer @editor-selected="onEditorSelected" />
```

Emitted when an editor annotation is selected. The payload contains the editor instance.

Payload:
```ts
{
  editor: AnnotationEditor
}
```

## Editors Slot

Editor sub-components must be placed inside the `editors` named slot. These components (Except `PDFCommentAnnotation`) don't render any visual elements but configure the ***global*** behavior and parameters of each editor type. They must only be placed once.


```vue
<VuePDF :pdf="pdf" editor-layer :editor-type="editorType">
  <template #editors>
    <PDFFreeTextAnnotation :color="color" :fontSize="fontSize" />
    <PDFHighlightAnnotation :color="color" :thickness="thickness" />
    <PDFInkAnnotation :color="color" :thickness="thickness" :opacity="opacity" />
    <PDFStampAnnotation ref="stamp" @alt-text="onAltText" />
    <PDFCommentAnnotation @comment="onComment" />
  </template>
</VuePDF>
```

See the individual editor component pages for detailed documentation:

- [FreeText](./editor/freetext.md)
- [Highlight](./editor/highlight.md)
- [Ink](./editor/ink.md)
- [Stamp](./editor/stamp.md)
- [Comment](./editor/comment.md)

## Full Example

```vue
<script setup>
import { ref, useTemplateRef } from 'vue'
import {
  VuePDF,
  usePDF,
  PDFFreeTextAnnotation,
  PDFHighlightAnnotation,
  PDFInkAnnotation,
  PDFStampAnnotation,
  PDFCommentAnnotation,
} from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF('document.pdf')

const editorType = ref(0)
const color = ref('#2196F3')
const fontSize = ref(20)
const thickness = ref(20)
const opacity = ref(1.0)

const stamp = useTemplateRef('stamp')

function addImage() {
  stamp.value?.addStamp()
}

function onAltText(editor, callback) {
  const text = prompt('Enter alt text:')
  callback(text)
}

function onComment(editor, callback) {
  const text = prompt('Enter comment:')
  callback(text)
}
</script>

<template>
  <div>
    <VuePDF
      :pdf="pdf"
      text-layer
      annotation-layer
      editor-layer
      :editor-type="editorType"
    >
      <template #editors>
        <PDFFreeTextAnnotation :color="color" :fontSize="fontSize" />
        <PDFHighlightAnnotation :color="color" :thickness="thickness" />
        <PDFInkAnnotation :color="color" :thickness="thickness" :opacity="opacity" />
        <PDFStampAnnotation ref="stamp" @alt-text="onAltText" />
        <PDFCommentAnnotation @comment="onComment" />
      </template>
    </VuePDF>
  </div>
</template>
```
