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
