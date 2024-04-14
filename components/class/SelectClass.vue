<template>
  <client-only>
    <el-select-v2
      v-model="selected"
      :options="options"
      :props="selectProps"
      filterable
      placeholder="请选择（输入可搜索）"
      @change="emit('update:modelValue', selected)"
    />
    <template #fallback>
      <SelectPlaceholder />
    </template>
  </client-only>
</template>

<script lang="ts" setup>
import SelectPlaceholder from '../utils/SelectPlaceholder.vue';

const props = withDefaults(defineProps<{
  modelValue: string | undefined;
  role?: 'student' | 'teacher';
}>(), {
  multiple: true,
  role: 'student',
});
const emit = defineEmits(['update:modelValue']);

const { $api } = useNuxtApp();

const selected = ref(props.modelValue);
const selectProps = {
  label: 'className',
  value: 'id',
};

const options = (await useTrpcAsyncData(() => $api.class.list.query())) ?? [];
</script>
