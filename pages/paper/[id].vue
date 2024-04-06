<template>
  <div class="mb-22 lg:mb-8 space-y-3 lg:space-y-4">
    <div class="lg:flex">
      <h1 class="w-full text-2xl lg:pr-[2em] lg:text-4xl">
        {{ info?.title }}
      </h1>
      <el-space :size="10" class="mb-2 lg:mb-0">
        <el-tag v-if="info?.isFeatured" type="success" size="large">
          <el-text style="color: var(--el-color-success);">
            <el-icon>
              <ElIconStar />
            </el-icon>
            优秀作业
          </el-text>
        </el-tag>
        <el-tag v-if="info?.score" size="large" :type="useScoreColor(info.score)" disable-transitions>
          <el-text :style="`color: var(--el-color-${useScoreColor(info.score)});`">
            <el-icon><ElIconHistogram /></el-icon>
            分数：{{ info.score }}
          </el-text>
        </el-tag>
        <el-tag v-if="info?.canDownload" type="info" size="large" disable-transitions>
          <el-text style="color: var(--el-color-info);">
            <el-icon><ElIconDownload /></el-icon>
            下载次数：{{ info?.downloadCount ?? 0 }}
          </el-text>
        </el-tag>
      </el-space>
    </div>

    <el-row :gutter="20">
      <el-col :span="device.isMobileOrTablet ? 24 : 6">
        <FoldableCard :can-fold="device.isMobileOrTablet" class="box-border h-full">
          <template #header>
            <el-icon><ElIconInfoFilled /></el-icon>
            论文信息
          </template>
          <el-descriptions :column="1">
            <el-descriptions-item v-if="info?.authors" label="作者">
              <GroupMembers :authors="info?.authors" :leader="info?.leader" type="link" class="inline" />
            </el-descriptions-item>
            <el-descriptions-item label="发布时间">
              {{ info?.createdAt.toLocaleDateString('zh-CN') }}
            </el-descriptions-item>
            <el-descriptions-item label="分类">
              <el-tag effect="plain" type="warning">
                {{ getCategoryName(info?.category) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="info?.keywords.length" label="关键词">
              <span class="space-x-1">
                <el-tag
                  v-for="(keyword, index) in info?.keywords" :key="index" class="my-1 cursor-pointer" type="info"
                  effect="plain" @click="searchTag(keyword)"
                >
                  {{ keyword }}
                </el-tag>
              </span>
            </el-descriptions-item>
          </el-descriptions>
          <Attachment :can-download="info?.canDownload" :paper-id="info?.id" :attachments="attachments" />
        </FoldableCard>
      </el-col>
      <el-col :span="device.isMobileOrTablet ? 24 : 18" class="mt-3 lg:mt-0">
        <FoldableCard :can-fold="device.isMobileOrTablet" class="box-border h-full">
          <template #header>
            <el-icon><ElIconList /></el-icon>
            摘要
          </template>
          <div class="text-justify text-[15px] leading-normal lg:text-base">
            {{ info?.abstract }}
          </div>
        </FoldableCard>
      </el-col>
    </el-row>

    <template v-if="attachments?.length && (attachments?.findIndex(e => e.S3FileId) !== -1)">
      <Preview :attachment="attachments?.filter(a => a.category === 'paperDocument')[0]" full-height />
    </template>

    <el-card v-if="info?.comment">
      <template #header>
        教师评语
      </template>
      {{ info?.comment }}
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { getCategoryName } from '~/constants/paper';

useHeadSafe({
  title: '论文信息',
});

const { $api } = useNuxtApp();
const route = useRoute();

const id = route.params.id.toString();
const device = useDevice();

const [info, attachments] = await useTrpcAsyncData(() => Promise.all([
  $api.paper.info.query({ id }),
  $api.paper.attachments.query({ id }),
])) ?? [];

function searchTag(keyword: string) {
  navigateTo({
    path: '/paper/list',
    query: {
      search: keyword,
    },
  });
}
</script>
