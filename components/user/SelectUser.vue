<template>
  <client-only>
    <el-select-v2
      v-model="selected"
      :options="options ?? []"
      :multiple="multiple"
      :max-collapse-tags="3"
      :props="selectProps"
      clearable
      collapse-tags
      collapse-tags-tooltip
      filterable
      placeholder="请选择（输入可搜索）"
      @change="emit('update:modelValue', selected)"
    >
      <template #default="{ item }">
        <span>
          {{ item.username }}
        </span>
        <span class="float-right pr-1 text-[11px] color-gray">{{ item.schoolId }}</span>
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
const selectProps = {
  label: 'username',
  value: 'id',
};

// TODO: don't show all the students
const { data: options, suspense } = useQuery({
  queryKey: ['user.list', { role: props.role }],
  queryFn: () => $api.user.list.query({ role: props.role }),
});
await suspense();
</script>
