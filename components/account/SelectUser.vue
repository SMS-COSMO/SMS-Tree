<template>
  <el-select
    v-model="selected"
    placeholder="请选择"
    clearable collapse-tags :multiple="multiple"
    :max-collapse-tags="4"
    class="w-[400px]"
    @change="emit('update:modelValue', selected)"
  >
    <template #header>
      <el-input v-model="searchContent" :placeholder="`搜索${roleName[role]}`" />
    </template>
    <el-option
      v-for="item in processedListData"
      :key="item.id"
      :label="item.username"
      :value="item.id"
    >
      <span>{{ item.username }}</span>
      <span
        style="color: var(--el-text-color-secondary)"
        class="float-right pr-1 text-[11px]"
      >
        {{ item.id }}
      </span>
    </el-option>
  </el-select>
</template>

<script lang="ts" setup>
import { useUserSearch } from '~/composables/useSearch';

const props = withDefaults(defineProps<{
  modelValue: string[] | string
  multiple?: boolean
  role?: 'student' | 'teacher'
}>(), {
  multiple: true,
  role: 'student',
});
const emit = defineEmits(['update:modelValue']);
const roleName = {
  student: '学生',
  teacher: '老师',
  admin: '管理员',
};

const selected = ref(props.modelValue);
const searchContent = ref('');
const { processedListData } = useUserSearch(searchContent, props.role);
</script>
