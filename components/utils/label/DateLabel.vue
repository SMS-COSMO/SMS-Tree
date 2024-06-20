<template>
  <el-tag v-if="date" type="info" disable-transitions>
    <el-icon class="i-tabler:calendar-time" />
    {{ date.toLocaleDateString('zh-CN') }}
  </el-tag>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  date?: Date | undefined;
}>(), {
});
</script>
