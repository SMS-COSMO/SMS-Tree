<template>
  <client-only>
    <el-select-v2
      v-model="selected"
      :options="options"
      :multiple="multiple"
      collapse-tags
      :max-collapse-tags="3"
      collapse-tags-tooltip
      clearable
      filterable
      placeholder="请选择（输入可搜索）"
      @change="emit('update:modelValue', selected)"
    >
      <template #default="{ item }">
        <span>
          {{ item.label }}
        </span>
        <span class="float-right pr-1 text-[11px] color-gray">{{ item.value }}</span>
      </template>
    </el-select-v2>
    <template #fallback>
      <SelectPlaceholder />
    </template>
  </client-only>
</template>

<script lang="ts" setup>
import SelectPlaceholder from '../utils/SelectPlaceholder.vue';

const props = withDefaults(defineProps<{
  modelValue: string[] | string;
  multiple?: boolean;
  role?: 'student' | 'teacher';
}>(), {
  multiple: true,
  role: 'student',
});
const emit = defineEmits(['update:modelValue']);

const { $api } = useNuxtApp();

const selected = ref(props.modelValue);
const options = (await useTrpcAsyncData(() => $api.user.list.query({ role: props.role })))
  ?.map(x => ({
    value: x.id,
    label: x.username,
  })) ?? [];
</script>
