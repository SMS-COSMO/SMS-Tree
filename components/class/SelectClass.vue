<template>
  <client-only>
    <el-select-v2
      v-model="selected"
      :options="options ?? []"
      :props="selectProps"
      filterable
      placeholder="请选择（输入可搜索）"
    />
    <template #fallback>
      <SelectPlaceholder />
    </template>
  </client-only>
</template>

<script lang="ts" setup>
import SelectPlaceholder from '../utils/SelectPlaceholder.vue';

withDefaults(defineProps<{
  role?: 'student' | 'teacher';
}>(), {
  multiple: true,
  role: 'student',
});
const selected = defineModel();

const { $api } = useNuxtApp();

const selectProps = {
  label: 'className',
  value: 'id',
};

const { data: options, suspense } = useQuery({
  queryKey: ['class.list'],
  queryFn: () => $api.class.list.query(),
});
await suspense();
</script>
