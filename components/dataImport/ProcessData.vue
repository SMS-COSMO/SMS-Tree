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
      <template v-if="!isSuccess && failedClassNames.length" #sub-title>
        <div class="flex items-center justify-center gap-4">
          <div>
            <h4>导入失败的班级</h4>
            <div class="flex flex-wrap gap-2">
              <el-tag v-for="className in failedClassNames" :key="className" type="danger">
                {{ className }}
              </el-tag>
            </div>
          </div>
          <div>
            <h4>导入成功的班级</h4>
            <div class="flex flex-wrap gap-2">
              <el-tag v-for="className in successClassNames" :key="className" type="success">
                {{ className }}
              </el-tag>
            </div>
          </div>
        </div>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import type { TImportDataResult } from '~/types';

const props = defineProps<{
  isFinished: boolean;
  importResult: TImportDataResult;
}>();
defineEmits<{ reset: [] }>();
const isSuccess = computed(() => props.importResult.length && props.importResult.every(item => item.success));
const failedClassNames = computed(() => props.importResult.filter(item => !item.success).map(item => item.name));
const successClassNames = computed(() => props.importResult.filter(item => item.success).map(item => item.name));
</script>
