<template>
  <client-only>
    <el-cascader
      v-model="cascaderValue"
      :options="categoryCascader"
      filterable
    />
    <template #fallback>
      <SelectPlaceholder width="250" />
    </template>
  </client-only>
</template>

<script setup lang="ts">
import SelectPlaceholder from '../utils/SelectPlaceholder.vue';
import { categoryCascader } from '~/constants/paper';

const model = defineModel<number>();

const cascaderValue = ref(-1);

watch(cascaderValue, (v: any) => {
  if (v)
    model.value = v[1] ?? 0;
});
</script>
