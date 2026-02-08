---
outline: deep
---

# Comment

The `PDFCommentAnnotation` component enables comment functionality on editor annotations, allowing users to add, view, edit, and delete comments associated with annotations on the PDF page.

## Import

```js
import { PDFCommentAnnotation } from '@tato30/vue-pdf'
```

## Usage

```vue
<script setup>
import { VuePDF, usePDF, PDFCommentAnnotation } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF('document.pdf')

function onComment(editor, callback) {
  const text = prompt('Enter comment:')
  callback(text)
}

function onRemoved(editor) {
  console.log('Comment removed from editor:', editor)
}
</script>

<template>
  <VuePDF :pdf="pdf" text-layer annotation-layer editor-layer :editor-type="3">
    <template #editors>
      <PDFCommentAnnotation @comment="onComment" @removed="onRemoved" />
    </template>
  </VuePDF>
</template>
```

::: info
The `PDFCommentAnnotation` component works alongside any editor type (Highlight, Ink, Stamp). It provides the comment popup UI and handles the comment creation flow.
:::

## Events

### comment

Emitted when an editor annotation requests a comment to be added. The callback must be invoked with the comment text.

```vue
<PDFCommentAnnotation @comment="onComment" />
```

```js
function onComment(editor, callback) {
  const text = prompt('Enter your comment:')
  callback(text)
}
```

| Parameter  | Type               | Description                                                 |
| ---------- | ------------------ | ----------------------------------------------------------- |
| `editor`   | `AnnotationEditor` | The editor annotation instance requesting the comment       |
| `callback` | `Function`         | Callback to provide the comment text, pass `null` to cancel |

::: tip
You can implement a custom comment dialog or modal instead of using `prompt`. Just call the `callback` with the comment text when the user submits.
:::

### removed

Emitted when a comment is deleted from an editor annotation.

```vue
<PDFCommentAnnotation @comment="onComment" @removed="onRemoved" />
```

```js
function onRemoved(editor) {
  console.log('Comment was removed from:', editor)
}
```

| Parameter | Type               | Description                                              |
| --------- | ------------------ | -------------------------------------------------------- |
| `editor`  | `AnnotationEditor` | The editor annotation from which the comment was removed |

## Comment Popup

The `PDFCommentAnnotation` component renders a built-in comment popup that appears when users interact with annotations that have comments. The popup displays:

- The comment creation date
- The comment text content
- Edit and delete buttons (visible when the comment is selected)

The popup supports both hover and click interactions:
- **Hover**: Shows the comment popup temporarily
- **Click**: Selects the comment popup, keeping it visible and showing edit/delete controls
