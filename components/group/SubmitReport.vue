<template>
  <el-card class="mb-5">
    <template #header>
      提交{{ category === 'thesisProposal' ? '开题' : '结题' }}报告
    </template>

    <ReportForm :category="category" type="create" />
  </el-card>
</template>

<script setup lang="ts">
defineProps<{
  category: TReportCategory;
}>();
</script>
