<template>
  <el-card class="card-container mb-2.5" @click="openPaper(paper)">
    <el-row style="gap: 6px">
      <el-tag v-if="paper?.isFeatured" type="success" disable-transitions>
        <el-icon>
          <ElIconStar />
        </el-icon>
        优秀作业
      </el-tag>
      <el-tag v-if="paper?.canDownload" disable-transitions>
        <el-icon>
          <ElIconDownload />
        </el-icon>
        可下载
      </el-tag>
      <el-tag type="info" disable-transitions>
        {{ paper?.createdAt?.toLocaleDateString('zh-CN') }}
      </el-tag>
      <el-text v-if="paper?.canDownload" type="info" size="small">
        下载次数：{{ paper?.downloadCount }}
      </el-text>
    </el-row>
    <el-row class="mt-2" style="gap: 8px">
      <el-text class="title break-normal">
        {{ paper?.title }}
      </el-text>
      <el-text>
        <GroupMembers :group-id="paper.groupId" type="text" :show-leader="false" />
      </el-text>
    </el-row>
    <el-row v-if="showAbstract" class="mt-2.5">
      <el-text size="small" :line-clamp="lineClamp" type="info" class="break-normal">
        {{ paper?.abstract }}
      </el-text>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import type { TPaperListOutputItem } from '~/types/index';

withDefaults(defineProps<{
  paper: TPaperListOutputItem
  showAbstract?: boolean
  lineClamp?: number
}>(), {
  showAbstract: false,
  lineClamp: 3,
});

function openPaper(paper: TPaperListOutputItem) {
  navigateTo(`/paper/${paper.id}`);
}
</script>

<style scoped lang="scss">
.title {
  font-weight: bold;
  font-size: 19px;
}

.card-container {
  cursor: pointer;
}

.card-container:hover {
  border-color: #D4D7DE !important;
  background-color: #F5F7FA !important;
}
</style>
