# Introduction

VuePDF is a **client-side** component for **Vue 3** that allows you to flexibly render PDF pages within your project. This library wraps `pdf.js` project so all main features of `pdf.js` are supported by `VuePDF` as well. 

## Installation

<CodeGroup>
  <CodeGroupItem title="NPM">

```bash:no-line-numbers
npm i @tato30/vue-pdf
```

  </CodeGroupItem>
  <CodeGroupItem title="YARN">

```bash:no-line-numbers
yarn add @tato30/vue-pdf
```

  </CodeGroupItem>
</CodeGroup>


## Basic Usage

The most basic usage is as simple as import the `VuePDF` and `usePDF` and uses it on your project :)

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