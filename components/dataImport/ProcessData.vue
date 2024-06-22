<template>
  <div v-if="!isFinished">
    <div class="w-full text-center">
      <h2>正在处理数据中，请不要关闭或离开页面...</h2>
    </div>
    <el-progress
      :percentage="100"
      :indeterminate="true"
      :show-text="false"
    />
  </div>
  <div v-else>
    <el-result
      :icon="isSuccess ? 'success' : 'error'"
      :title="isSuccess ? '数据导入成功' : '数据导入出错'"
    >
      <template #extra>
        <el-button color="#15803d" @click="$emit('reset')">
          开始新的导入
        </el-button>
      </template>
    </el-result>
    <ImportResult :data="{ data: importResult }" :show-remove="false" show-header />
  </div>
</template>

<script setup lang="ts">
import type { TImportDataResult } from '~/types';

const props = defineProps<{
  isFinished: boolean;
  importResult: TImportDataResult;
}>();
defineEmits<{ reset: [] }>();

const isSuccess = computed(
  () => props.importResult.length && props.importResult.every(item => item.success),
);
</script>
