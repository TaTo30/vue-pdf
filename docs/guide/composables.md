---
outline: [2,3]
---

# Composables

## usePDF

This package provides a default composable named `usePDF` that loads and prepare the PDF Document for it usage with `VuePDF` component, also let you get some basic information and properties about the document.

Keep in mind that `usePDF` use the same [DocumentInitParameter](https://github.com/mozilla/pdf.js/blob/38287d943532eee939ceffbe6861163f93805ca7/src/display/api.js#L145) as `pdf.js`, so you could decide how `pdf.js` should loads your PDF and then make use of more of `pdf.js` features that are not included in `VuePDF` by default.

```vue
<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const { pdf, pages, info } = usePDF('sample.pdf')
</script>

<template>
  <VuePDF :pdf="pdf" />
</template>
```

### Reactivity

`usePDF` is also reactive if you use a `ref<src>` instead of a plain `src`, when the value of `ref` changes the returned values also will chage.

```vue
<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'

// Changing currentPdf value will change pdf, pages and info values
const currentPdf = ref('sample.pdf')
const { pdf, pages, info } = usePDF(currentPdf)
</script>

<template>
  <VuePDF :pdf="pdf" />
</template>
```

### Parameters

#### src

Type: `string | URL | TypedArray | DocumentInitParameters | ref<string> | ref<URL> | ref<TypedArray> | ref<DocumentInitParameters>` <br/>
Required: `True`

This parameter is the same `src`  of [pdf.js](https://github.com/mozilla/pdf.js/blob/38287d943532eee939ceffbe6861163f93805ca7/src/display/api.js#L145)

```js
const { pdf, pages, info } = usePDF('sample.pdf')
```

#### options

Type: `object`

An object with the following properties:

- `onPassword`: Callback function to request the document password if no password (or wrong password) was provided.
- `onProgress`: Callback function to enable progress monitor.
- `onError`: function to handle pdf loading errors

```js
function onPassword(updatePassword, reason) {
  console.log(`Reason for callback: ${reason}`)
  updatePassword('password1234')
}

function onProgress({ loaded, total }) {
  console.log(`${loaded / total * 100}% Loaded`)
}

function onError(reason) {
  console.error(`PDF loading error: ${reason}`)
}

const { pdf, pages, info } = usePDF('sample.pdf', {
  onPassword,
  onProgress,
  onError
})
```

### Properties

> All values returned by [`usePDF`](#usepdf-composable) are [`shallowRef`](https://vuejs.org/api/reactivity-advanced.html#shallowref) objects.

#### pdf

Type: `PDFDocumentLoadingTask`

Document's loading task, see [PDFDocumentLoadingTask](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFDocumentLoadingTask.html) for more details.

---

#### pages

Type: `int`

Document's number pages.

---

#### info

Type: `object`

Document's information object.

```json
{
  "metadata": {...}, // Metadata object
  "attachments": {...}, // File attachments object
  "javascript": [...], // Array of embedded scripts
  "outline": {...} // Outline objects
}
```
---

#### getPDFDestination

Type: `function`

This function returns the page number referenced by `dest` object used by internal-links or outline object. Check the related example in [Table of Content](../examples/advanced/toc.md)

---

#### print

Type: `function`

Open the browser's print dialog with current PDF loaded with the following parameters:

- `dpi`: Pages resolution (default: `150`).
- `filename`: Filename of the printed file (default: `'filename'`).

---

#### download

Type: `function`

Trigger a downloading action using an `HTMLAnchorElement` with the following parameters:

- `filename`: Filename of the downloaded file (default: `'filename'`)

---

### Document API

You can access to [PDFDocumentProxy](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFDocumentProxy.html) through [pdf's](#pdf) promise property and use its API methods to get more document's info like `annotationStorage` or use functions like `saveDocument`, `cleanup`, etc.

```js
const { pdf } = usePDF('document.pdf')

function doSomething() {
  pdf.value.promise.then((doc) => {
    // doc.annotationsStorage
    // doc.saveDocument()
    // doc.cleanup()
    // doc.getData()
    // ...
  })
}
```

## Make your own composable

Using `usePDF` it's not required, you can use the `pdf.js` API in your components or build your own composable yourself. Just need to be sure to send on [`pdf`](./props.md#pdf) prop a `shallowRef | ref` [PDFDocumentLoadingTask](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFDocumentLoadingTask.html) object.

```vue
<script setup>
import { onMounted, ref } from 'vue'
import * as PDFJS from 'pdfjs-dist'

const pdf = ref()

function loadPDF() {
  const loadingTask = PDFJS.getDocument('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
  pdf.value = loadingTask
}

onMounted(() => {
  loadPDF()
})
</script>

<template>
  <div>
    <VuePDF :pdf="pdf" />
  </div>
</template>
```