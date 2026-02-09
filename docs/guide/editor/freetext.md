---
outline: deep
---

# FreeText

The `PDFFreeTextAnnotation` component configures the free text annotation editor, allowing users to add text annotations directly on the PDF page.

Using this component is ***optional***. It allows you to override default editor parameters and listen events, but if not used, the free text editor will still work with default parameters as long as `editor-type` is set to `3`.


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


## Props

### color

Type: `string` <br />
Required: `true`

The default color of the text annotation.

> [!WARNING]
> Only values prefixed with `#`, `rgb` or `rgba` are supported.

```vue
<PDFFreeTextAnnotation color="#2196F3" />
```

### fontSize

Type: `number` <br />
Required: `true`

The font size of the text annotation in pixels.

```vue
<PDFFreeTextAnnotation :fontSize="20" />
```

::: info
Both `color` and `fontSize` props are reactive, changing their values will update the editor parameters for new annotations and selected annotations in layer.
:::

## Events

### dragging

Emitted when a free text annotation is being dragged.

```vue
<PDFFreeTextAnnotation @dragging="onDragging" />
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

Emitted when the color of a free text annotation has been changed from editor's toolbar.

```vue
<PDFFreeTextAnnotation @color-changed="onColorChanged" />
```

Payload:
```ts
{
  editor: AnnotationEditor,
  color: string
}
```
