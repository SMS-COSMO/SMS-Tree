<template>
  <client-only>
    <el-select
      v-model="model"
      placeholder="Select"
      size="large"
      class="w-60"
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
        <StateBadge :state="(item.value as TClassState)" size="default" />
      </el-option>
    </el-select>
    <template #fallback>
      <SelectPlaceholder width="240" />
    </template>
  </client-only>
</template>

<script setup lang="ts">
import type { TClassState } from './StateBadge.vue';

const model = defineModel<TClassState>({ required: true });
</script>
