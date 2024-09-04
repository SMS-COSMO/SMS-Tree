<template>
  <client-only>
    <el-select-v2
      v-model="selected"
      :options="options ?? []"
      :multiple="multiple"
      :max-collapse-tags="3"
      :props="selectProps"

      clearable collapse-tags filterable collapse-tags-tooltip
      placeholder="请选择（输入可搜索）"
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

const {
  multiple = true,
  role = 'student',
} = defineProps<{
  multiple?: boolean;
  role?: 'student' | 'teacher';
}>();
const selected = defineModel();

const { $api } = useNuxtApp();

const selectProps = {
  label: 'username',
  value: 'id',
};

// TODO: don't show all the students
const { data: options, suspense } = useQuery({
  queryKey: ['user.list', { role }],
  queryFn: () => $api.user.list.query({ role }),
});
await suspense();
</script>
