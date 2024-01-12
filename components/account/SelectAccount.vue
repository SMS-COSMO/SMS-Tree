<template>
  <el-select
    v-model="selected"
    multiple
    clearable
    placeholder="请选择"
    collapse-tags
    :max-collapse-tags="4"
    class="w-[400px]"
  >
    <template #header>
      <el-input v-model="searchContent" placeholder="搜索学生" />
    </template>
    <el-option
      v-for="item in processedListData"
      :key="item.id"
      :label="item.username"
      :value="item.id"
    >
      <span>{{ item.username }}</span>
      <span
        style="color: var(--el-text-color-secondary)"
        class="float-right pr-1 text-[11px]"
      >
        {{ item.id }}
      </span>
    </el-option>
  </el-select>
</template>

<script lang="ts" setup>
import { useSearchStudent } from '~/composables/useSearch';

const selected = ref([]);
const searchContent = ref('');
const { processedListData } = useSearchStudent(searchContent);
</script>
