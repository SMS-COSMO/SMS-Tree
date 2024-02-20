<template>
  <el-select
    v-model="model"
    placeholder="Select"
    size="large"
    style="width: 240px"
  >
    <el-option
      v-for="item in [
        { label: '已归档', value: 'archived' },
        { label: '初始化', value: 'initialized' },
        { label: '选择小组', value: 'selectGroup' },
        { label: '提交论文', value: 'submitPaper' },
      ]"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    >
      <StateBadge :state="(item.value as TClassState)" />
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import type { TClassState } from './StateBadge.vue';

const model = defineModel<TClassState>({ required: true });
</script>
