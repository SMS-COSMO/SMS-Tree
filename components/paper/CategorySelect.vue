<template>
  <client-only>
    <el-select-v2
      v-model="selected"
      :options="category ?? []"
      filterable
      placeholder="请选择（输入可搜索）"
    />
    <template #fallback>
      <SelectPlaceholder />
    </template>
  </client-only>
</template>

<script setup lang="ts">
const selected = defineModel<number>({ required: true });
</script>
