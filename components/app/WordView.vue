<template>
  <iframe v-if="type === 'word'" :src="`https://view.officeapps.live.com/op/embed.aspx?src=${url}`" frameborder='0'
    class="iframe" />
  <iframe v-if="type === 'pdf'" :src="url" frameborder='0' class="iframe" />
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
  type: string;
  url: string;
}>(), {
  type: 'word',
});
</script>

<style lang="scss">
.iframe {
  width: 100%;
  height: calc(100vh - 150px);
}
</style>