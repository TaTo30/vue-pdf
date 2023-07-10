# Methods

## reload

Allows to reload page render task, useful to update parent width when [`fit-parent`](./props.html#fit-parent) prop is used

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

Cancel the render task if page is currently rendering.

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