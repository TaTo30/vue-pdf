# Methods

## reload

Reload page's render task, useful to update some props, for example, the parent width when [`fit-parent`](./props.html#fit-parent) is used

```vue
<script setup>
import { ref } from 'vue'

const VPDF = ref({})
function someEvent() {
  VPDF.value.reload()
}
</script>

<template>
  <VuePDF ref="VPDF" :pdf="pdf" />
</template>
```

## cancel

Cancel the render task if the page is currently rendering.

```vue
<script setup>
import { ref } from 'vue'

const VPDF = ref({})
function someEvent() {
  VPDF.value.cancel()
}
</script>

<template>
  <VuePDF ref="VPDF" :pdf="pdf" />
</template>
```

## destroy

Destroy the current `PDFDocumentLoadingTask` and terminate its worker.

```vue
<script setup>
import { ref } from 'vue'

const VPDF = ref({})
function closeDocument() {
  VPDF.value.destroy()
}
</script>

<template>
  <VuePDF ref="VPDF" :pdf="pdf" />
</template>
```