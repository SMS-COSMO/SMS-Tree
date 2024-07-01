<!-- HTTP Response Code Error Page -->

<template>
  <div class="h-content flex flex-col px-4">
    <el-card class="mx-auto my-auto max-w-[800px] w-full">
      <el-result icon="error">
        <template #title>
          <h1>
            {{ errorCode(error?.statusCode) }}
          </h1>
        </template>
        <template #sub-title>
          <pre class="bg-slate-100 px-5 py-2 text-slate-600 rounded">{{ error?.statusMessage }}</pre>
        </template>
        <template #extra>
          <el-button @click="navigateTo('/')">
            返回主页
          </el-button>
        </template>
      </el-result>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

defineProps({
  error: Object as () => NuxtError,
});

function errorCode(code?: number) {
  code ??= 404;
  switch (code) {
    case 404:
      return '404 页面不存在';
    case 500:
      return '500 服务器内部错误';
    default:
      return code.toString();
  }
};
</script>
