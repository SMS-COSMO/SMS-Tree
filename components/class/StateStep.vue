<template>
  <client-only>
    <el-steps
      :active="step.indexOf(classInfo?.state ?? '')"
      finish-status="wait"
      :direction="direction"
    >
      <el-step :icon="ElIconClock" title="等待分组" />
      <el-step :icon="ElIconUser" title="选择小组" />
      <el-step :icon="ElIconDataBoard" title="开题报告" />
      <el-step :icon="ElIconDataLine" title="结题报告" />
      <el-step :icon="ElIconUpload" title="提交论文" />
      <el-step v-if="showArchived" :icon="ElIconBox" title="归档" />
    </el-steps>
    <template #fallback>
      <el-skeleton :rows="1" animated />
    </template>
  </client-only>
</template>

<script setup lang="ts">
import type { TClassContent } from '~/types';

withDefaults(defineProps<{
  direction: 'vertical' | 'horizontal';
  classInfo: TClassContent;
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
