<script setup>
import { ref, triggerRef, watchEffect } from 'vue';
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import { withBase } from 'vitepress/client';
import ChaptersList from './ChaptersList.vue';

const { pdf, info, getPDFDestination } = usePDF(withBase('/example_045.pdf'))
const eventValue = ref({})
const outlineTree = ref([])

watchEffect(() => {
  if (info.value.outline !== undefined) {
    outlineTree.value = info.value.outline.map(function convert(node) {
      return {
        title: node.title,
        destination: getPDFDestination(node.dest),
        items: node.items.map((item) => {
          return convert(item)
        }),
      }
    })
  }
})
triggerRef(info)

function onChapterClick(value) {
  value.then(v => {
    console.log(v)
    eventValue.value = v
  })
}
</script>

<template>
  <div id="toc_wrapper">
    <div class="toc">
      <ChaptersList
        :items="outlineTree"
        @chapterClick="onChapterClick"
      >
      </ChaptersList>
    </div>
    <div>
      <div class="language-json" data-ext="json">
        <pre class="language-json"><code>{{ eventValue }}</code></pre>
      </div>

      <div class="vue-pdf-container">
        <VuePDF :pdf="pdf" :scale="0.75" />
      </div>
    </div>
  </div>
</template>

<style>
#toc_wrapper {
  display: flex;
  flex-direction: row;
}
#toc_wrapper .toc {
  width: 300px;
  background-color: #eaeaea;
}
#toc_wrapper ol ol {
  padding-left: 20px;
}
#toc_wrapper ol {
  padding-left: 2em;
}
#toc_wrapper a {
  color: black;
}
</style>
