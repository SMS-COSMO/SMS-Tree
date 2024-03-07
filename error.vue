<template>
  <el-card class="mx-auto mt-30vh max-w-200">
    <h1 style="font-size: 80px; text-align: center; margin: 20px;">
      {{ error?.statusCode }}
    </h1>
    <h1 style="font-size: 30px; text-align: center;">
      Page Not Found
    </h1>
  </el-card>
</template>

<script setup lang="ts">
defineProps({
  error: Object,
});
</script>
