# VuePDF

VuePDF is a **Vue 3** wrapper for pdf.js that enable you to display pdf pages in your project. this package consist in two parts: PDFProxy Composable and VuePDF Component, will be explained in more details later in this document.

## Install

No install info yet.

## Compatibility

This package is for Vue 3 and supports the same browsers as Vue 3.
If you want a package for Vue 2 or older browsers check this project from FranckFreiburger: vue-pdf.

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
    const onProgress = ({loaded, total}) => {
      console.log(`${loaded / total * 100}% Loaded`);
    }

    const onPassword = (updatePassword, _) => {
      updatePassword('password')
    }

    const { pdf } = PDFProxy("document.pdf", onProgress, onPassword)

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

### **src**

Type: `string | URL | TypedArray`

This param is the same `src`  of pdf.js

### **onProgress**

Type: `function`

Callback function to enable loading progress monitor

### **onPassword**

Type: `function`

Callback function to request document password

### **Returns**

### **pdf**

Type: `PDFDocumentLoadingTask`

The loading task of document, see [PDFDocumentLoadingTask]([https://](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFDocumentLoadingTask.html)) for more details

### **pages**

Type: `int`

Pages number of document

### **info**

Type: `object`

Info about document

## VuePDF Component

This is the component to render a pdf page.

### **Props**

### **pdf**

Type: `PDFDocumentLoadingTask` <br/>
Required: `True`

The PDFDocumentLoadingTask obtained from [PDFProxy](#pdf)

```html
<VuePDF :pdf="pdf" />
```

### **:page**

Type: `int` <br/>
Default: `1`

Page to render, this prop must be the page number starting at 1

```html
<VuePDF :pdf="pdf" :page="2" />
```

### **:scale**

Type: `int` <br />
Default: `1`

Scale to render page

```html
<VuePDF :pdf="pdf" :page="1" :scale="0.5" />
```

### **:text-layer**

Type: `boolean` <br />
Default: `false`

Enable text selection in page

```html
<VuePDF :pdf="pdf" :page="1" text-layer />
```

### **:annotation-layer**

Type: `boolean` <br />
Default: `false`

Enable document annotations like links, popups, etc.

```html
<VuePDF :pdf="pdf" :page="1" annotation-layer />
```

### **Events**

### **@loaded** -> `object`

Emitted when page has finishes rendering in view

```vue
<template>
  <VuePDF :pdf="pdf" :page="2"  @loaded="loadedEvent"  />
</template>

const loadedEvent = (value) => {
  console.log(value);
},

```

### **@annotation** -> `object`

Emitted when user has interaction with any annotation in document view

```vue
<template>
  <VuePDF :pdf="pdf" :page="2"  @annotation="annotationEvent"  />
</template>

const annotationEvent = (value) => {
  console.log(value);
},

```