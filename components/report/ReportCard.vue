<template>
  <el-card class="mb-2 cursor-pointer lg:mb-2.5 hover:border-color-[#D4D7DE]! hover:bg-hover-bg!" @click="dialogVisible = true">
    <el-tag type="info" disable-transitions>
      {{ report.createdAt.toLocaleDateString('zh-CN') }}
    </el-tag>
    <div class="mt-1">
      <el-text class="break-normal font-bold text-lg!">
        {{ report.category === 'thesisProposal' ? '开题报告' : '结题报告' }}
      </el-text>
    </div>
  </el-card>

  <client-only>
    <el-dialog
      v-model="dialogVisible"
      :title="report.category === 'thesisProposal' ? '开题报告' : '结题报告'"
      width="1000"
    >
      <div class="mb-2 text-lg font-bold">
        创建时间
      </div>
      <el-tag type="info" disable-transitions>
        {{ report.createdAt.toLocaleDateString('zh-CN') }}
      </el-tag>
      <div class="mb-2 mt-4 text-lg font-bold">
        报告文档
      </div>
      <Preview :attachment="reportDocument" />
      <div class="mb-2 mt-4 text-lg font-bold">
        报告PPT
      </div>
      <Preview :attachment="reportPresentation" />
      <template #footer>
        <el-button color="#146E3C" @click="modifyDialogVisible = true">
          修改
        </el-button>
      </template>
    </el-dialog>
    <el-dialog
      v-model="modifyDialogVisible"
      draggable align-center
      title="修改报告"
    >
      <ReportForm :category="report.category" type="modify" :report-id="report.id" />
    </el-dialog>
  </client-only>
</template>

<script setup lang="ts">
import type { RouterOutput } from '~/types';

const props = defineProps<{
  report: RouterOutput['group']['content']['reports'][0];
}>();

const dialogVisible = ref(false);
const modifyDialogVisible = ref(false);

const reportDocument = computed(() => props.report?.attachments?.filter(a => a.category === 'reportDocument')[0]);
const reportPresentation = computed(() => props.report?.attachments?.filter(a => a.category === 'reportPresentation')[0]);
</script>
