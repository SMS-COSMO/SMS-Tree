<template>
  <el-card
    class="mb-2 cursor-pointer lg:mb-2.5 hover:border-color-[#D4D7DE]! hover:bg-hover-bg!"
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
      <el-tag :type="scoreColor(paper?.score)" disable-transitions>
        <el-icon><ElIconHistogram /></el-icon>
        分数：{{ paper?.score }}
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
      <el-text v-if="'authors' in paper">
        <GroupMembers :authors="paper.authors" type="text" :show-leader="false" />
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
import type { TRawPaper } from '~/server/db/db';
import type { TPaperListSafeItem } from '~/types/index';

withDefaults(defineProps<{
  paper: TPaperListSafeItem | TRawPaper;
  showAbstract?: boolean;
  lineClamp?: number;
}>(), {
  showAbstract: false,
  lineClamp: 3,
});

function scoreColor(score: 'A' | 'B' | 'C' | 'D' | null) {
  if (score === 'A')
    return 'success';
  else if (score === 'B')
    return 'warning';
  else
    return 'danger';
}
</script>
