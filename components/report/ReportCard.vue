<template>
  <CompactCard
    class="mb-2 cursor-pointer md:mb-2.5 hover:border-color-[#D4D7DE]! hover:bg-hover-bg!"
    @click="dialogVisible = true"
  >
    <el-row class="gap-[6px]">
      <el-tag v-if="isAdmin && report.read" type="success">
        <el-icon class="i-tabler:check" />
        已阅
      </el-tag>
      <el-tag type="info" disable-transitions>
        {{ report.createdAt.toLocaleDateString('zh-CN') }}
      </el-tag>
    </el-row>
    <div class="mt-1">
      <el-text class="break-normal font-bold text-lg!">
        {{ report.category === 'thesisProposal' ? '开题报告' : '结题报告' }}
      </el-text>
    </div>
  </CompactCard>

  <client-only>
    <el-dialog
      v-model="dialogVisible"
      :title="report.category === 'thesisProposal' ? '开题报告' : '结题报告'"
      width="1200"
    >
      <ReportContent :report="report" :is-admin="isAdmin" />
    </el-dialog>
  </client-only>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  report: TReport;
  isAdmin?: boolean;
}>(), {
  isAdmin: false,
});

const dialogVisible = ref(false);
</script>
