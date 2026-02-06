---
outline: deep
---

# Highlight

The `PDFHighlightAnnotation` component configures the highlight annotation editor, allowing users to highlight text on the PDF page.

## Import

```js
import { PDFHighlightAnnotation } from '@tato30/vue-pdf'
```

## Usage

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF, PDFHighlightAnnotation } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF('document.pdf')
const color = ref('#FFEB3B')
const thickness = ref(12)
</script>

<template>
  <VuePDF :pdf="pdf" text-layer annotation-layer editor-layer :editor-type="9">
    <template #editors>
      <PDFHighlightAnnotation :color="color" :thickness="thickness" />
    </template>
  </VuePDF>
</template>
```

::: tip
Set `editor-type` to `9` (`AnnotationEditorType.HIGHLIGHT`) to activate the highlight editor mode.
:::

## Props

### color

Type: `string` <br />
Required: `true`

The color of the highlight. The color value must match one of the values defined in [colorOptions](#coloroptions).

```vue
<PDFHighlightAnnotation color="#FFEB3B" :thickness="12" />
```

### thickness

Type: `number` <br />
Required: `true`

The thickness of the highlight.

```vue
<PDFHighlightAnnotation color="#FFEB3B" :thickness="12" />
```

### colorOptions

Type: `HighlightEditorColors` <br />
Required: `false` <br />
Default:
```ts
{
  yellow: ['#FFEB3B', '#FFFFCC'],
  green: ['#8BC34A', '#53FFBC'],
  pink: ['#FFCBE6', '#F6B8FF'],
  red: ['#F44336', '#FF4F5F'],
  blue: ['#2196F3', '#80EBFF'],
}
```

Custom highlight color options. Each entry maps a color name to a tuple of `[normalColor, highContrastColor]`.

```vue
<script setup>
const customColors = {
  yellow: ['#FFEB3B', '#FFFFCC'],
  green: ['#8BC34A', '#53FFBC'],
  orange: ['#FF9800', '#FFD180'],
}
</script>

<PDFHighlightAnnotation color="#FFEB3B" :thickness="12" :color-options="customColors" />
```

::: warning
Highlight color options can only be set once during initialization. Changing them after the editor has been created will have no effect.
:::

::: info
Both `color` and `thickness` props are reactive, changing their values will update the editor parameters for new annotations.
:::

## Events

### colorChanged

Emitted when the color of a highlight annotation has been changed.

```vue
<PDFHighlightAnnotation
  :color="color"
  :thickness="thickness"
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
