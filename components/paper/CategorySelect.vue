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

const model = defineModel<number>({ required: true });

const cascaderValue = ref(-1);
// Set initial value to model value
cascaderValue.value = model.value;
watch(cascaderValue, (v: any) => {
  if (v)
    model.value = v[1] ?? 0;
});

// Reset cascader when modelValue changes
watch(model, (v) => {
  if (v === -1)
    cascaderValue.value = v;
});
</script>
