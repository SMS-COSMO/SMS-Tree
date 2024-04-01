<template>
  <client-only>
    <el-cascader
      v-model="cascaderValue"
      :options="categoryCascaderWithAll"
      class="w-full"

      clearable collapse-tags collapse-tags-tooltip
      :props="props"
      placeholder="选择分类"
    />
    <template #fallback>
      <SelectPlaceholder width="250" />
    </template>
  </client-only>
</template>

<script setup lang="ts">
import type { CascaderOption } from 'element-plus';
import SelectPlaceholder from '../utils/SelectPlaceholder.vue';
import { categoryCascader } from '~/constants/paper';

withDefaults(defineProps<{
  withAll?: boolean;
  widthFull?: boolean;
}>(), {
  withAll: false,
  widthFull: false,
});
const model = defineModel<number[]>();

const props = { multiple: true };
const cascaderValue = ref(model.value);
const categoryCascaderWithAll: CascaderOption[] = [
  ...categoryCascader,
];

watch(cascaderValue, (v: any) => {
  if (v)
    model.value = v.length === 1 ? v[0] : v.map((x: any) => x[1]);
});
</script>
