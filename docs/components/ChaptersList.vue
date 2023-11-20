<script>
export default {
  name: 'ChaptersList',
  props: {
    items: Array,
  },
  methods: {
    onChapterClick: function (e) {
      this.$emit('chapterClick', e)
    },
  },
}
</script>

<template>
  <ol>
    <li v-for="item in items">
      <a href="#" @click.prevent="$emit('chapterClick', item.destination)">{{ item.title }}</a>
      <div v-if="item.items.length">
        <ChaptersList
          :items="item.items"
          @chapterClick="onChapterClick"
        ></ChaptersList>
      </div>
    </li>
  </ol>
</template>
