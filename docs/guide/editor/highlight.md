---
outline: deep
---

# Highlight

The `PDFHighlightAnnotation` component configures the highlight annotation editor, allowing users to highlight text on the PDF page.

Using this component is ***optional***. It allows you to override default editor parameters and listen events, but if not used, the highlight editor will still work with default parameters as long as `editor-type` is set to `9`.


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

## Props


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

<PDFHighlightAnnotation :color-options="customColors" />
```

::: warning
Highlight color options can only be set once during initialization. Changing them after the editor has been created will have no effect.
:::

### color

Type: `string` <br />
Required: `true`

The color of the highlight. The color value must be one of the values defined in [colorOptions](#coloroptions).

```vue
<PDFHighlightAnnotation color="#FFEB3B"  />
```

### thickness

Type: `number` <br />
Required: `true`

The thickness of the highlight.

```vue
<PDFHighlightAnnotation :thickness="12" />
```

::: info
Both `color` and `thickness` props are reactive, changing their values will update the editor parameters for new annotations.
:::

## Events

### colorChanged

Emitted when the color of a highlight annotation has been changed from editor's toolbar.

```vue
<PDFHighlightAnnotation @color-changed="onColorChanged" />
```

Payload:
```ts
{
  editor: AnnotationEditor,
  color: string
}
```
