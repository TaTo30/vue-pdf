<script setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import { withBase } from 'vitepress/client';
import { ref } from 'vue';

const { pdf } = usePDF(withBase('/example_014.pdf'))

const filters = ref(['Widget', 'Widget.Tx', 'Widget.Btn', 'Widget.Ch'])
const selectedFilter = ref(['Widget'])
const vuePDFRef = ref(null)

function reloadPage() {
  vuePDFRef.value.reload()
}
</script>

<template>
  <div class="vue-pdf-container">
    <div>
      <select v-model="selectedFilter[0]" class="select-example" @change="reloadPage">
        <option v-for="flt in filters" :key="flt" :value="flt">
          {{ flt }}
        </option>
      </select>
    </div>
    <VuePDF ref="vuePDFRef" :pdf="pdf" annotation-layer :annotations-filter="selectedFilter" />
  </div>
</template>
