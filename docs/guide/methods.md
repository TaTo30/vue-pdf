# Methods

## **reload**

Allows to reload page render task, useful to update parent width when [`fit-parent`](/guide/props.html#fit-parent) prop is used

```vue
<script setup>
import { ref } from 'vue'

const VPDF = ref({})
const someEvent: () => {
    VPDF.value.reload()
}
</script>

<template>
  <VuePDF ref="VPDF" :pdf="pdf" />
</template>
```
