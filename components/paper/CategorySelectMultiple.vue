<template>
  <client-only>
    <el-select-v2
      v-model="selected"
      :options="category ?? []"
      multiple
      clearable
      collapse-tags
      placeholder="选择分类"
    />
    <template #fallback>
      <SelectPlaceholder />
    </template>
  </client-only>
</template>

<script setup lang="ts">
const selected = defineModel<number[]>({ required: true });
</script>
