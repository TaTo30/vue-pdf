# VuePDF

![Latest version](https://img.shields.io/npm/v/@tato30/vue-pdf?style=flat-square)
![Downloads](https://img.shields.io/npm/dw/@tato30/vue-pdf?style=flat-square)
![License](https://img.shields.io/npm/l/@tato30/vue-pdf?style=flat-square)

## Introduction

VuePDF is a **Vue 3** component for pdf.js that allows you to flexibly display PDF pages within your project.

## Installation

```console
npm i @tato30/vue-pdf
```

```console
yarn add @tato30/vue-pdf
```

## Basic Usage

```vue
<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const { pdf, pages, info } = usePDF('document.pdf')

console.log(`Document has ${pages} pages`)
console.log(`Document info: ${info}`)
</script>

<template>
  <VuePDF :pdf="pdf" />
</template>
```

## usePDF

This function loads and prepare the PDF Document for it usage also let you get some basic information and properties about the document.

### **Parameters**

#### **src**

Type: `string | URL | TypedArray | DocumentInitParameters` <br/>
Required: `True`

This parameter is the same `src`  of [pdf.js](https://github.com/mozilla/pdf.js/blob/38287d943532eee939ceffbe6861163f93805ca7/src/display/api.js#L145)

```js
const { pdf, pages, info } = usePDF('document.pdf')
```

#### **options**

Type: `object`

An object with the following properties:

- `onPassword`: Callback function to request the document password if no password (or wrong password) was provided.
- `onProgress`: Callback function to enable progress monitor.
- `onError`: function to handle pdf loading errors

```js
function onPassword(updatePassword, reason) {
  console.log(`Reason for callback: ${reason}`)
  updatePassword('documentpassword1234')
}

function onProgress({ loaded, total }) {
  console.log(`${loaded / total * 100}% Loaded`)
}

function onError(reason) {
  console.error(`PDF loading error: ${reason}`)
}

const { pdf, pages, info } = usePDF('document.pdf', {
  onPassword,
  onProgress,
  onError
})
```

### **Returns**

#### **pdf**

Type: `PDFDocumentLoadingTask`

The loading task of document, see [PDFDocumentLoadingTask](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFDocumentLoadingTask.html) for more details.

#### **pages**

Type: `int`

Number of document pages.

#### **info**

Type: `object`

Document information object.

```json
{
  "metadata": {...}, // Metadata object
  "attachments": {...}, // File attachments object
  "javascript": [...], // Array of embedded scripts
}
```
