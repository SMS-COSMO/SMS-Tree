<template>
  <client-only>
    <el-steps
      :active="step.indexOf(classInfo?.state ?? '')"
      finish-status="wait"
      :direction="direction"
    >
      <el-step icon="i-tabler-clock" title="等待分组" />
      <el-step icon="i-tabler:users" title="选择小组" />
      <el-step icon="i-tabler:presentation" title="开题报告" />
      <el-step icon="i-tabler:presentation-analytics" title="结题报告" />
      <el-step icon="i-tabler:file-upload" title="提交论文" />
      <el-step v-if="showArchived" icon="i-tabler:archive" title="归档" />
    </el-steps>
    <template #fallback>
      <el-skeleton :rows="1" animated />
    </template>
  </client-only>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  direction: 'vertical' | 'horizontal';
  classInfo: TClass;
  showArchived?: boolean;
}>(), {
  showArchived: false,
});

const step = [
  'initialized', // 初始化
  'selectGroup', // 选择小组
  'thesisProposal', // 开题报告
  'concludingReport', // 结题报告
  'submitPaper', // 提交论文
  'archived', // 归档
];
</script>
