# VuePDF

VuePDF is a **Vue 3** wrapper for pdf.js that enable you to display pdf pages in your project. this package consist in two parts: PDFProxy Composable and VuePDF Component, will be explained in more details later in this document.

## Compatibility

This package is for Vue 3 and supports the same browsers as Vue 3.
If you want a package for Vue 2 or older browsers check this project from FranckFreiburger: [vue-pdf](https://github.com/FranckFreiburger/vue-pdf).

## Content

* [**Install**](#install)
* [**Live Demo**](#live-demo)
* [**Basic Usage**](#basic-usage)
* [**PDFProxy Composable**](#pdfproxy-composable)
  * [**Params**](#params)
  * [**Returns**](#returns)
* [**VuePDF Component**](#vuepdf-component)
  * [**Props**](#props)
  * [**Events**](#events)

## Install

```console
npm i @tato30/vue-pdf
```


## Live Demo

You can find a [live demo](https://tato30.github.io/VuePDF/) to check a few examples to use the component.

## Basic Usage

```vue
<template>
  <VuePDF :pdf="pdf" :page="1" />
</template>

<script>
import {PDFProxy, VuePDF} from 'VuePDF'

export default {
  components: {
    VuePDF
  },
  setup(){
    const { pdf, pages, info } = PDFProxy("document.pdf")

    console.log(`Document has ${pages} pages`)
    console.log(`Document info: ${info}`)

    return {
      pdf
    }
  }
}
</script>
```

## PDFProxy Composable

This function is the pdf loader, let you get the basic information and properties about pdf document.

### **Params**

#### **src**

Type: `string | URL | TypedArray` <br/>
Required: `True`

This param is the same `src`  of pdf.js

```js
const { pdf, pages, info } = PDFProxy("document.pdf")
```

#### **options**

Type: `object`

an object with the possible properties:

- `onPassword`: Callback function to request the document password if wrong or no passwrod provider.
- `onProgress`: Callback function to enable progress monitor.

```js
const onPassword = (updatePassword, reason) => {
  console.log(`Reason for callback: ${reason}`)
  updatePassword('documentpassword1234')
}

const onProgress = ({loaded, total}) => {
  console.log(`${loaded / total * 100}% Loaded`);
}

const { pdf, pages, info } = PDFProxy("document.pdf", {
  onPassword: onPassword,
  onProgress: onProgress
})
```

### **Returns**

#### **pdf**

Type: `PDFDocumentLoadingTask`

The loading task of document, see [PDFDocumentLoadingTask]([https://](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFDocumentLoadingTask.html)) for more details

#### **pages**

Type: `int`

Pages number of document

#### **info**

Type: `object`

Info object about document

---

## VuePDF Component

This is the component to render a pdf page.

### **Props**

#### **:pdf**

Type: `PDFDocumentLoadingTask` <br/>
Required: `True`

The PDFDocumentLoadingTask obtained from [PDFProxy](#pdf)

```html
<VuePDF :pdf="pdf" />
```

#### **:page**

Type: `int` <br/>
Default: `1`

Page to render, this prop must be the page number starting at 1

```html
<VuePDF :pdf="pdf" :page="2" />
```

#### **:scale**

Type: `int` <br />
Default: `1`

Scale to render page

```html
<VuePDF :pdf="pdf" :page="1" :scale="0.5" />
```

#### **:text-layer**

Type: `boolean` <br />
Default: `false`

Enable text selection in page

```html
<VuePDF :pdf="pdf" :page="1" text-layer />
```

#### **:annotation-layer**

Type: `boolean` <br />
Default: `false`

Enable document annotations like links, popups, etc.

```html
<VuePDF :pdf="pdf" :page="1" annotation-layer />
```

### **Events**

#### **@loaded** -> `object`

Emitted when page has finishes rendering in view

```vue
<template>
  <VuePDF :pdf="pdf" :page="2"  @loaded="loadedEvent"  />
</template>

const loadedEvent = (value) => {
  console.log(value);
},

```

#### **@annotation** -> `object`

Emitted when user has interaction with any annotation in document view

```vue
<template>
  <VuePDF :pdf="pdf" :page="2"  @annotation="annotationEvent"  />
</template>

const annotationEvent = (value) => {
  console.log(value);
},

```