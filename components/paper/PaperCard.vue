<template>
  <el-card @click="openPaper(paper)" class="card-container mb-2.5">
    <el-row style="gap: 6px">
      <el-tag type="success" disable-transitions v-if="paper?.isFeatured">
        <el-icon>
          <ElIconStar />
        </el-icon>
        优秀作业
      </el-tag>
      <el-tag disable-transitions v-if="paper?.canDownload">
        <el-icon>
          <ElIconDownload />
        </el-icon>
        可下载
      </el-tag>
      <el-tag type="info" disable-transitions>{{ paper?.createdAt?.toLocaleDateString('zh-CN') }}</el-tag>
      <el-text type="info" size="small" v-if="paper?.canDownload">
        下载次数：{{ paper?.downloadCount }}
      </el-text>
    </el-row>
    <el-row class="mt-2" style="gap: 8px">
      <el-text class="title break-normal">{{ paper?.title }}</el-text>
      <el-text>
        <GroupMembers :groupId="paper.groupId" type="text" :showLeader="false" />
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

const openPaper = (paper: TPaperListOutputItem) => {
  navigateTo(`/paper/${paper.id}`);
};

withDefaults(defineProps<{
  paper: TPaperListOutputItem;
  showAbstract?: boolean;
  lineClamp?: number;
}>(), {
  showAbstract: false,
  lineClamp: 3,
});
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
