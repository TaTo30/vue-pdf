<div align="center">
  <img width=250 src="./docs/.vuepress/public/logo.png" />
  <h1>VuePDF</h1>
</div>


![Latest version](https://img.shields.io/npm/v/@tato30/vue-pdf?style=flat-square)
![Downloads](https://img.shields.io/npm/dw/@tato30/vue-pdf?style=flat-square)
![License](https://img.shields.io/npm/l/@tato30/vue-pdf?style=flat-square)

<div align="center">
  <h2><a href="https://tato30.github.io/VuePDF/">📖Documentation</a></h2>
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