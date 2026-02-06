---
outline: deep
---

# Ink

The `PDFInkAnnotation` component configures the ink/drawing annotation editor, allowing users to draw freehand annotations on the PDF page.

## Import

```js
import { PDFInkAnnotation } from '@tato30/vue-pdf'
```

## Usage

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF, PDFInkAnnotation } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF('document.pdf')
const color = ref('#F44336')
const thickness = ref(5)
const opacity = ref(1.0)
</script>

<template>
  <VuePDF :pdf="pdf" text-layer annotation-layer editor-layer :editor-type="15">
    <template #editors>
      <PDFInkAnnotation :color="color" :thickness="thickness" :opacity="opacity" />
    </template>
  </VuePDF>
</template>
```

::: tip
Set `editor-type` to `15` (`AnnotationEditorType.INK`) to activate the ink editor mode.
:::

## Props

### color

Type: `string` <br />
Required: `true`

The color of the ink stroke.

```vue
<PDFInkAnnotation color="#F44336" :thickness="5" :opacity="1.0" />
```

### thickness

Type: `number` <br />
Required: `true`

The thickness of the ink stroke in pixels.

```vue
<PDFInkAnnotation color="#F44336" :thickness="5" :opacity="1.0" />
```

### opacity

Type: `number` <br />
Required: `true`

The opacity of the ink stroke, a value between `0` and `1`.

```vue
<PDFInkAnnotation color="#F44336" :thickness="5" :opacity="0.5" />
```

::: info
All props (`color`, `thickness`, and `opacity`) are reactive, changing their values will update the editor parameters for new annotations.
:::

## Events

### dragging

Emitted when an ink annotation is being dragged.

```vue
<PDFInkAnnotation
  :color="color"
  :thickness="thickness"
  :opacity="opacity"
  @dragging="onDragging"
/>
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

Emitted when an ink annotation is being resized.

```vue
<PDFInkAnnotation
  :color="color"
  :thickness="thickness"
  :opacity="opacity"
  @resizing="onResizing"
/>
```

Payload:
```ts
{
  editor: AnnotationEditor,
  width: number,
  height: number
}
```

### colorChanged

Emitted when the color of an ink annotation has been changed.

```vue
<PDFInkAnnotation
  :color="color"
  :thickness="thickness"
  :opacity="opacity"
  @color-changed="onColorChanged"
/>
```

Payload:
```ts
{
  editor: AnnotationEditor,
  color: string
}
```
