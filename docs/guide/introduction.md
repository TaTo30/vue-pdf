---
outline: [2,3]
---

# Introduction

VuePDF is a **client-side** component for **Vue 3** that allows you to flexibly render PDF pages within your project. This library wraps `pdf.js` library so all main features of `pdf.js` are supported by `VuePDF` as well. 

## Installation

::: code-group
```sh [npm]
npm i @tato30/vue-pdf
```

```sh [yarn]
yarn add @tato30/vue-pdf
```
:::

## Basic Usage

The most basic usage is as simple as import the `VuePDF` and `usePDF` and use them on your project :)

```vue
<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'

const { pdf } = usePDF('sample.pdf')
</script>

<template>
  <VuePDF :pdf="pdf" />
</template>
```

## Working With Layers

### Text and Annotations

This component supports text selection and annotation interaction by enabling them with `text-layer` and `annotation-layer` props respectively, but for this layers renders correctly is necessary set some `css` styles, it can be done by importing default styles from `@tato30/vue-pdf/style.css`.

```vue
<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF('sample.pdf')
</script>

<template>
  <VuePDF :pdf="pdf" text-layer annotation-layer />
</template>
```

Check the examples:

- [Text Layer](../examples/basic/text_layer.md)
- [Annotation Layer](../examples/basic/annotation_layer.md.md)

You could create your own custom styles and set them in your project, use this styles as a guide:

- [text-layer styles](https://github.com/mozilla/pdf.js/blob/master/web/text_layer_builder.css)
- [annotation-layer styles](https://github.com/mozilla/pdf.js/blob/master/web/annotation_layer_builder.css)

### XFA Forms
XFA forms also can be supported by enabling them from `usePDF`.

```vue
<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF({
  url: '/example_xfa.pdf',
  enableXfa: true,
})
</script>

<template>
  <VuePDF :pdf="pdf" />
</template>
```

Check the example:

- [XFA Forms](../examples/basic/xfa_layer.md)

## Server-Side Rendering

`VuePDF` is a client-side library, so if you are working with a SSR framework like `nuxt`, surely it will throw an error during the building stage, if that is the case, you could wrap `VuePDF` in some sort of "client only" directive or component, also `usePDF` should be wrapped.

## Supporting Non-Latin characters

If you are looking for display non-latin text or you are getting a warning like:
> Warning: Error during font loading: CMapReaderFactory not initialized, see the useWorkerFetch parameter

you will probably need to copy the `cmaps` directory from `node_modules/pdfjs-dist` to your project's `public` directory, don't worry about no having `pdfjs-dist` it's installed alongside `vue-pdf` package.


```
.
├─ node_modules
│  ├─ pdfjs-dist
│  │  └─ cmaps    <--- Copy this directory
├─ src
├─ public         
|  ├─ *cmaps*     <--- Paste it here!
├─ package.json
|  ...
```

With that made the `cmaps` will be available on relative path `/cmaps/`, now you need the tell `usePDF` uses that `cmaps` url:

```js
const { pdf } = usePDF({
  url: pdfsource,
  cMapUrl: '/cmaps/',
})
```

## Contributing

Any idea, suggestion or contribution to the code or documentation are very welcome.

```sh
# Clone the repository
git clone https://github.com/TaTo30/vue-pdf.git

# Change to code folder
cd vue-pdf
cd vue-pdf/docs # In case you want to update docs

# Install node_modules
npm install

# Run code with hot reload
npm run dev
```