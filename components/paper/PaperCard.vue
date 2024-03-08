<template>
  <el-card
    class="mb-2.5 cursor-pointer hover:border-color-[#D4D7DE]! hover:bg-hover-bg!"
    @click="navigateTo(`/paper/${paper.id}`)"
  >
    <el-row class="gap-[6px]">
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
    <el-row class="mt-2 gap-2">
      <el-text class="break-normal font-bold text-xl!">
        {{ paper?.title }}
      </el-text>
      <el-text>
        <GroupMembers v-if="'groupId' in paper" :group-id="paper.groupId" type="text" :show-leader="false" />
        <GroupMembers v-else :authors="paper.authors" type="text" :show-leader="false" />
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
import type { TPaperListItem, TPaperListWithAuthorItem } from '~/types/index';

withDefaults(defineProps<{
  paper: TPaperListItem | TPaperListWithAuthorItem;
  showAbstract?: boolean;
  lineClamp?: number;
}>(), {
  showAbstract: false,
  lineClamp: 3,
});
</script>
