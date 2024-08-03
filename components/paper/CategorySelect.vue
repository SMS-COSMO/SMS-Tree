<template>
  <client-only>
    <el-select-v2
      v-model="selected"
      :options="category ?? []"
      placeholder="请选择"
    />
    <template #fallback>
      <SelectPlaceholder />
    </template>
  </client-only>
</template>

<script setup lang="ts">
const selected = defineModel<number>({ required: true });
</script>
