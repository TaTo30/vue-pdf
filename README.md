<div align="center">
  <img width=250 src="./docs/public/logo.png" />
  <h1>VuePDF</h1>
</div>

<p>
  <a href="https://www.npmjs.com/package/@tato30/vue-pdf" target="_blank">
    <img src="https://img.shields.io/npm/v/@tato30/vue-pdf?style=flat-square" />
  </a>
  <a href="https://www.npmjs.com/package/@tato30/vue-pdf" target="_blank" >
    <img src="https://img.shields.io/npm/dw/@tato30/vue-pdf?style=flat-square" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/npm/l/@tato30/vue-pdf?style=flat-square" />
  </a>
</p>

<div align="center">
  <h2><a href="https://tato30.github.io/vue-pdf/">📖Documentation</a></h2>
</div>

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

## Reference

* [Props](./docs/guide/props.md)
* [Events](./docs/guide/events.md)
* [Methods](./docs/guide/methods.md)
* [Slots](./docs/guide/slots.md)


## Working With Layers

### Text and Annotations

This component supports text-selection and annotation-interaction by enabling them with `text-layer` and `annotation-layer` props respectively, but for this layers renders correctly is necessary setting `css` styles, it can be done by importing default styles from `@tato30/vue-pdf/style.css`.

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

You can also create your own custom styles and set them in your project, use this examples as guide:

- [text-layer styles](https://github.com/mozilla/pdf.js/blob/master/web/text_layer_builder.css)
- [annotation-layer styles](https://github.com/mozilla/pdf.js/blob/master/web/annotation_layer_builder.css)

### XFA Forms <badge type="tip" text="v1.7" vertical="middle" />

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

## Server-Side Rendering

`VuePDF` is a client-side library, so if you are working with SSR frameworks like `nuxt`, surely will throw error during building stage, if that the case, you could wrap library in some "client only" directive or component, also `usePDF` should be wrapped.

## Contributing

Any idea, suggestion or contribution to the code or documentation are very welcome.

```sh
# Clone the repository
git clone https://github.com/TaTo30/VuePDF.git

# Change to code folder
cd VuePDF

# Install node_modules
npm install

# Run code with hot reload
npm run dev
```
