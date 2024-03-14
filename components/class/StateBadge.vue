<template>
  <el-tag
    :type="(stateTable[state].type as '' | 'info' | 'success' | 'warning' | 'danger')"
    :size="size"
    :class="size === 'large' ? 'font-bold' : ''"
  >
    {{ stateTable[state].name }}
  </el-tag>
</template>

<script setup lang="ts">
export type TClassState = 'archived' | 'initialized' | 'selectGroup' | 'submitPaper';
defineProps<{
  size: 'default' | 'large';
  state: TClassState;
}>();

const stateTable = {
  archived: { name: '已归档', type: 'info' },
  initialized: { name: '初始化', type: '' },
  selectGroup: { name: '选择小组', type: 'success' },
  submitPaper: { name: '提交论文', type: 'warning' },
};
</script>
