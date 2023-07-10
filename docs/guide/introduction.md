# Introduction

VuePDF is a **Vue 3** client-side component for pdf.js that allows you to flexibly display PDF pages within your project.

## Installation

```console
npm i @tato30/vue-pdf
```

```console
yarn add @tato30/vue-pdf
```

## Basic Usage

The most basic usage is so simple as import the `VuePDF` component and `usePDF` composable and display on `<template>` :)

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

Check the follow examples:

- [Text-Layer](../examples/basic/text_layer.md)
- [Annotation-Layer](../examples/basic/annotation_layer.md.md)

You can also create your own custom styles and set them in your project, use this examples as guide:

- [text-layer styles](https://github.com/mozilla/pdf.js/blob/master/web/text_layer_builder.css)
- [annotation-layer styles](https://github.com/mozilla/pdf.js/blob/master/web/annotation_layer_builder.css)

## Server-Side Rendering

`VuePDF` is a client-side library, so if you are working with SSR frameworks like `nuxt` is necessary to find a way to ensure that `VuePDF` will be running in browser instead server.
