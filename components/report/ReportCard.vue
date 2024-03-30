<template>
  <el-card class="mb-2 cursor-pointer lg:mb-2.5 hover:border-color-[#D4D7DE]! hover:bg-hover-bg!" @click="dialogVisible = true">
    <el-row class="gap-[6px]">
      <el-tag type="info" disable-transitions>
        {{ report.createdAt.toLocaleDateString('zh-CN') }}
      </el-tag>
    </el-row>
    <div class="mt-1">
      <el-text class="break-normal font-bold text-xl!">
        {{ report.category === 'thesisProposal' ? '开题报告' : '结题报告' }}
      </el-text>
    </div>
  </el-card>

  <client-only>
    <el-dialog
      v-model="dialogVisible"
      title="报告"
      width="500"
    >
      <el-descriptions
        :column="1"
        direction="vertical"
        size="large"
      >
        <el-descriptions-item>
          <template #label>
            <div class="font-bold">
              创建时间
            </div>
          </template>
          <el-tag type="info" disable-transitions>
            {{ report.createdAt.toLocaleDateString('zh-CN') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="font-bold">
              报告文档
            </div>
          </template>
          <Preview :attachment="attachments?.filter(a => a.category === 'reportDocument')[0]" />
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="font-bold">
              报告PPT
            </div>
          </template>
          <Preview :attachment="attachments?.filter(a => a.category === 'reportPresentation')[0]" />
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </client-only>
</template>

<script setup lang="ts">
import type { TRawReport } from '~/server/db/db';

const props = defineProps<{ report: TRawReport }>();
const { $api } = useNuxtApp();

const dialogVisible = ref(false);

const attachments = await useTrpcAsyncData(() => $api.report.attachments.query({ id: props.report.id }));
</script>

<style>
.el-descriptions__label {
  width: 200px;
}
</style>
