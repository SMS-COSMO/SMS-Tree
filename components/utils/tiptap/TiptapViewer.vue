<template>
  <div class="tiptap" v-html="html" />
</template>

<script setup lang="ts">
import { generateHTML } from '@tiptap/html';
import { tipTapExtensions } from './extensions';

const { content } = defineProps<{
  content: string | undefined | null;
}>();

const html = computed(() => {
  let json = {};
  if (content) {
    try {
      json = JSON.parse(content);
    } catch {}
  }

  return generateHTML(json, tipTapExtensions);
});
</script>
