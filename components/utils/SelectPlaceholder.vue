<template>
  <el-skeleton animated style="line-height: 0;">
    <template #template>
      <el-skeleton-item variant="rect" :style="`height: 45px; border-radius: 10px; width: ${width === '' ? '100%' : `${width}px`}`" />
    </template>
  </el-skeleton>
</template>

<script setup lang="ts">
defineProps(['width']);
</script>
