<template>
  <el-skeleton animated class="leading-0">
    <template #template>
      <el-skeleton-item
        variant="rect"
        class="`rounded h-[40px]!"
        :style="`max-width: ${width === '' ? '100%' : `${width}px`}`"
      />
    </template>
  </el-skeleton>
</template>

<script setup lang="ts">
defineProps(['width']);
</script>
