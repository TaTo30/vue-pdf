<div align="center">
  <img width=250 src="https://raw.githubusercontent.com/TaTo30/vue-pdf/master/samples/logo.png" />
  <h1>VuePDF</h1>
</div>


![Version](https://img.shields.io/npm/v/@tato30/vue-pdf?style=flat-square)
![pdf.js version](https://img.shields.io/npm/dependency-version/%40tato30%2Fvue-pdf/pdfjs-dist)
![Downloads](https://img.shields.io/npm/dw/@tato30/vue-pdf?style=flat-square)
![Licence](https://img.shields.io/npm/l/@tato30/vue-pdf?style=flat-square)
![GitHub Sponsors](https://img.shields.io/github/sponsors/tato30)


<div align="center">
  <h2><a href="https://tato30.github.io/vue-pdf/">📖Documentation</a></h2>
</div>

# Introduction

VuePDF is a **client-side** component for **Vue 3** that allows you to flexibly render PDF pages within your project. This library wraps `pdf.js` library so all main features of `pdf.js` are supported by `VuePDF` as well. 

## Installation

```sh
npm i @tato30/vue-pdf
yarn add @tato30/vue-pdf
```

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

## Minimal Build

If you want to trim the bundle size and handle the PDF worker configuration on your own, you can use the **minimal** entry point. This version leaves the worker setup entirely in your hands, which is useful when the worker file must be hosted somewhere else or bundled separately.

```ts
import { GlobalWorkerOptions } from 'pdfjs-dist'
import { VuePDF, usePDF } from '@tato30/vue-pdf/minimal'

GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs'

const { pdf } = usePDF('sample.pdf')
```

Be sure to set `GlobalWorkerOptions.workerSrc` before calling `usePDF`, otherwise the worker will fail to load.

> [!IMPORTANT]
> Version of worker script must match with pdfjs-dist version.

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

### XFA Forms
XFA forms also can be supported by enabling them from `usePDF`.

```vue
<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF({
  url: '/xfa.pdf',
  enableXfa: true,
})
</script>

<template>
  <VuePDF :pdf="pdf" />
</template>
```

### Annotation Editor Layer

VuePDF also exposes the `pdf.js` annotation editor layer, letting users create and edit FreeText, Highlight, Ink, Stamp, and other annotations directly in the viewer. To enable it, set the `editor-layer` prop, select an `editor-type`, and mount the corresponding editor parameters component inside the `editors` slot.

```vue
<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF, PDFFreeTextAnnotation } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const { pdf } = usePDF('sample.pdf')
const editorType = ref(3)
</script>

<template>
  <VuePDF :pdf="pdf" text-layer annotation-layer editor-layer :editor-type="editorType">
    <template #editors>
      <PDFFreeTextAnnotation color="#2196F3" :fontSize="20" />
    </template>
  </VuePDF>
</template>
```


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

## Supporting legacy browsers

If you need to support legacy browsers you could use any polyfill to patch modern functions, but this workaround only works on the **main** thread, the *worker* that runs in other thread will not get reached by any polyfills you apply. 

This package embed and configure the `pdf.js` *worker* for you but in case you need to support legacy environments you will need to configure the `legacy` *worker* by adding this code:

```vue
<script setup lang="ts">
+ import * as PDFJS from 'pdfjs-dist'; 
+ import LegacyWorker from 'pdfjs-dist/legacy/build/pdf.worker.min?url'; 
import { VuePDF, usePDF } from '@tato30/vue-pdf';

+ PDFJS.GlobalWorkerOptions.workerSrc = LegacyWorker 

const { pdf } = usePDF(/** */)
</script>
```

Just be aware to set the `legacy` worker before use `usePDF`.

## Common issues

### Promise.withResolvers

> Promise.withResolvers is not a function

That throws because `Promise.withResolvers` is a relative "new feature" of JavaScript's Promises, even if almost all browsers [support it](https://caniuse.com/?search=withResolvers), in NodeJS this feature was fully included on version v22 as a base feature. To solve this issue consider updating node version if you are currently using a lower one.

### Top-level await is not available in the configured target environment

> [!ERROR] Top-level await is not available in the configured target environment ("chrome87", "edge88", "es2020", "firefox78", "safari14" + 2 overrides)

This error is more related to ESBuild settings instead of compatibility matters, `Top-level await` is (as usually) a "new feature" of the JavaScript definition, practically all browsers [support it](https://caniuse.com/?search=top-level%20await) and was included on NodeJS since v14.

To solve this issue you will need to add this settings on `vite.config`:

```js
optimizeDeps: {
  esbuildOptions: {
    supported: {
      'top-level-await': true,
    },
  },
},
esbuild: {
  supported: {
    'top-level-await': true,
  },
}
```

### Scanned JPEG PDFs render blank pages or missing wasm url
If you load a PDF that only contains scanned images (often generated by office scanners) and see warnings such as `JpxImage#instantiateWasm: UnknownErrorException: Ensure that the wasmUrl API parameter is provided` or `Unable to decode image "img_p0_1"`, then the OpenJPEG WebAssembly bundle is missing. Provide the `wasmUrl` option so `pdf.js` can fetch the required decoder assets:

```ts
const { pdf } = usePDF({
  url: '/documents/sample.pdf',
  wasmUrl: 'https://unpkg.com/pdfjs-dist@5.4.530/wasm/',
})
```

If your application runs offline, copy `node_modules/pdfjs-dist/wasm` into `public/wasm` (or any static folder) and point `wasmUrl` to that relative path, for example `/wasm/`.

> [!IMPORTANT]
> Version of wasm script must match with pdfjs-dist version.


## Contributing

Any idea, suggestion or contribution to the code or documentation are very welcome.

```sh
# Clone the repository
git clone https://github.com/TaTo30/vue-pdf.git
# Change to code folder
cd vue-pdf
# Install node_modules
npm install
# Run code with hot reload
npm run dev
# Run docs
npm run dev:docs
```
