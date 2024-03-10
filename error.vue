<template>
  <el-card class="mx-auto mt-[30vh] max-w-200">
    <h1 class="m-4 text-center text-20">
      {{ error?.statusCode }}
    </h1>
    <h1 class="text-center text-[30px]">
      {{ error?.message }}
    </h1>
  </el-card>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

defineProps({
  error: Object as () => NuxtError,
});
</script>
