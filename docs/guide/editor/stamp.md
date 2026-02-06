---
outline: deep
---

# Stamp

The `PDFStampAnnotation` component configures the stamp/image annotation editor, allowing users to add image stamps to the PDF page.

## Import

```js
import { PDFStampAnnotation } from '@tato30/vue-pdf'
```

## Usage

```vue
<script setup>
import { useTemplateRef } from 'vue'
import { VuePDF, usePDF, PDFStampAnnotation } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF('document.pdf')
const stamp = useTemplateRef('stamp')

function addStamp() {
  stamp.value?.addStamp()
}

function onAltText(editor, callback) {
  const text = prompt('Enter alt text:')
  callback(text)
}
</script>

<template>
  <div>
    <button @click="addStamp">Add Stamp</button>
    <VuePDF :pdf="pdf" text-layer annotation-layer editor-layer :editor-type="13">
      <template #editors>
        <PDFStampAnnotation ref="stamp" @alt-text="onAltText" />
      </template>
    </VuePDF>
  </div>
</template>
```

::: tip
Set `editor-type` to `13` (`AnnotationEditorType.STAMP`) to activate the stamp editor mode.
:::

## Methods

### addStamp

Add a new stamp annotation to the page. This method can be called with different source types:

```ts
addStamp(source?: File | string | null): void
```

| Parameter | Type                     | Description                                                             |
| --------- | ------------------------ | ----------------------------------------------------------------------- |
| `source`  | `File \| string \| null` | Image source: a `File` object, a URL string, or `null` to open a picker |

```vue
<script setup>
import { useTemplateRef } from 'vue'
import { PDFStampAnnotation } from '@tato30/vue-pdf'

const stamp = useTemplateRef('stamp')

// Open the file picker
function addEmpty() {
  stamp.value?.addStamp()
}

// Add stamp from URL
function addFromUrl() {
  stamp.value?.addStamp('https://example.com/image.png')
}

// Add stamp from File object
function addFromFile(file) {
  stamp.value?.addStamp(file)
}
</script>

<template>
  <PDFStampAnnotation ref="stamp" />
</template>
```

::: warning
`addStamp` can only be called when `editor-type` is set to `13` (STAMP). Calling it with a different editor type will log a warning.
:::

## Events

### altText

Emitted when a stamp annotation requests alt text input (e.g., for accessibility). The callback must be invoked with the alt text string.

```vue
<PDFStampAnnotation ref="stamp" @alt-text="onAltText" />
```

```js
function onAltText(editor, callback) {
  const text = prompt('Enter alt text for the image:')
  callback(text)
}
```

| Parameter  | Type               | Description                                           |
| ---------- | ------------------ | ----------------------------------------------------- |
| `editor`   | `AnnotationEditor` | The stamp editor instance                             |
| `callback` | `Function`         | Callback to provide the alt text, pass `null` to skip |

### dragging

Emitted when a stamp annotation is being dragged.

```vue
<PDFStampAnnotation ref="stamp" @dragging="onDragging" />
```

Payload:
```ts
{
  editor: AnnotationEditor,
  x: number,
  y: number
}
```

### resizing

Emitted when a stamp annotation is being resized.

```vue
<PDFStampAnnotation ref="stamp" @resizing="onResizing" />
```

Payload:
```ts
{
  editor: AnnotationEditor,
  width: number,
  height: number
}
```
