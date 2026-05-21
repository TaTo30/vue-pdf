# Slots

## loading: default

Content rendered while the page render task is in progress.

```vue
<template>
  <VuePDF :pdf="pdf">
    <div>
      Loading...
    </div>
  </VuePDF>
</template>
```

## overlay

Adds content over the rendered page.

Slot props:

- `width`: current page viewport width in px
- `height`: current page viewport height in px

```vue
<template>
  <VuePDF :pdf="pdf">
    <template #overlay="{ width, height }" >
      <div>
        Page size {{ width }}x{{ height }}
      </div>
    </template>
  </VuePDF>
</template>
```

## editors

Named slot used to mount editor helper components.

Use this slot when `editor-layer` is enabled to register editor controllers such as `PDFFreeTextAnnotation`, `PDFHighlightAnnotation`, `PDFInkAnnotation`, `PDFStampAnnotation`, and `PDFCommentAnnotation`.

```vue
<template>
  <VuePDF
    :pdf="pdf"
    text-layer
    annotation-layer
    editor-layer
    :editor-type="editorType"
  >
    <template #editors>
      <PDFFreeTextAnnotation :color="color" :fontSize="20" />
      <PDFCommentAnnotation @comment="onComment" />
    </template>
  </VuePDF>
</template>
```

::: warning
Do not add a `<canvas>` element as the root element of slot content. Doing so can break rendering after reload operations (for example scale, rotation, or page changes).
:::