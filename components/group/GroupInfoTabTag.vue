<template>
  <el-tag v-if="show" type="success" size="small" class="mr-2 mt-0.5">
    <el-icon class="i-tabler:check" />
  </el-tag>
  <el-tag v-else type="warning" size="small" class="mr-2 mt-0.5">
    <el-icon class="i-tabler:loader" />
  </el-tag>
</template>

<script setup lang="ts">
defineProps<{ show: boolean | undefined }>();
</script>
