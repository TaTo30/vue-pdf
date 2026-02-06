---
outline: deep
---

# FreeText

The `PDFFreeTextAnnotation` component configures the free text annotation editor, allowing users to add text annotations directly on the PDF page.

## Import

```js
import { PDFFreeTextAnnotation } from '@tato30/vue-pdf'
```

## Usage

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF, PDFFreeTextAnnotation } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF('document.pdf')
const color = ref('#2196F3')
const fontSize = ref(20)
</script>

<template>
  <VuePDF :pdf="pdf" text-layer annotation-layer editor-layer :editor-type="3">
    <template #editors>
      <PDFFreeTextAnnotation :color="color" :fontSize="fontSize" />
    </template>
  </VuePDF>
</template>
```

::: tip
Set `editor-type` to `3` (`AnnotationEditorType.FREETEXT`) to activate the free text editor mode.
:::

## Props

### color

Type: `string` <br />
Required: `true`

The color of the text annotation.

```vue
<PDFFreeTextAnnotation color="#2196F3" :fontSize="20" />
```

### fontSize

Type: `number` <br />
Required: `true`

The font size of the text annotation in pixels.

```vue
<PDFFreeTextAnnotation color="#2196F3" :fontSize="20" />
```

::: info
Both `color` and `fontSize` props are reactive, changing their values will update the editor parameters for new annotations.
:::

## Events

### dragging

Emitted when a free text annotation is being dragged.

```vue
<PDFFreeTextAnnotation
  :color="color"
  :fontSize="fontSize"
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

### colorChanged

Emitted when the color of a free text annotation has been changed.

```vue
<PDFFreeTextAnnotation
  :color="color"
  :fontSize="fontSize"
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
