<template>
  <el-tag v-if="isFeatured" type="success" disable-transitions>
    <el-icon class="i-tabler:star" />
    优秀作业
  </el-tag>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  isFeatured?: boolean | undefined;
}>(), {
});
</script>
