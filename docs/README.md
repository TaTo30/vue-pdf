---
home: true
heroImage: /logo.png
title: Home
# heroImage: /images/hero.png
actions:
  - text: Get started
    link: /guide/introduction
    type: primary
  - text: Examples
    link: /examples/basic/one_page
    type: secondary
# features:
#   - title: Simplicity First
#     details: Minimal setup with markdown-centered project structure helps you focus on writing.
#   - title: Vue-Powered
#     details: Enjoy the dev experience of Vue, use Vue components in markdown, and develop custom themes with Vue.
#   - title: Performant
#     details: VuePress generates pre-rendered static HTML for each page, and runs as an SPA once a page is loaded.
#   - title: Themes
#     details: Providing a default theme out of the box. You can also choose a community theme or create your own one.
#   - title: Plugins
#     details: Flexible plugin API, allowing plugins to provide lots of plug-and-play features for your site.
#   - title: Bundlers
#     details: Default bundler is Vite, while Webpack is also supported. Choose the one you like!
# footer: MIT Licensed | Copyright © 2018-present Evan You
---

<script setup>
import { ref } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf';

const page = ref(1)
const { pdf, pages } = usePDF('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf')
</script>

<div class="container">
    <div>
      <button class="button-example" @click="page = page > 1? page - 1 : page">PREV</button>
      <span>{{page}}/{{pages}}</span>
      <button class="button-example" @click="page = page < pages? page + 1 : page">NEXT</button>
    </div>
    <div style="width: 500px">
      <VuePDF :pdf="pdf" :page="page" fit-parent />
    </div>
</div>
