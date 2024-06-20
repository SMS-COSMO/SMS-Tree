<template>
  <el-tag v-if="canDownload" disable-transitions>
    <el-icon class="i-tabler:download" />
    可下载
  </el-tag>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  canDownload?: boolean | undefined;
}>(), {
});
</script>
