<template>
  <el-backtop :right="isSmallScreen ? 30 : 100" :bottom="100" />

  <div class="mb-22 lg:mb-8 space-y-3 lg:space-y-4">
    <div class="lg:flex">
      <h1 class="w-full text-2xl lg:pr-[2em] lg:text-4xl">
        <el-tag v-if="info?.isFeatured" type="success" size="large">
          <el-text style="color: var(--el-color-success);">
            <el-icon>
              <ElIconStar />
            </el-icon>
            优秀作业
          </el-text>
        </el-tag>
        {{ info?.title }}
      </h1>
      <el-space :size="20" class="mb-2 lg:mb-0">
        <el-statistic v-if="info?.score" :value="info?.score">
          <template #title>
            分数
          </template>
        </el-statistic>
        <el-divider v-if="info?.score" direction="vertical" class="h-10!" />
        <el-statistic :value="info?.downloadCount">
          <template #title>
            下载次数
          </template>
        </el-statistic>
      </el-space>
    </div>

    <el-row :gutter="20">
      <el-col :span="isSmallScreen ? 24 : 6">
        <FoldableCard :can-fold="isSmallScreen" class="box-border h-full">
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
            <el-descriptions-item v-if="info?.keywords.length" label="关键词">
              <el-tag
                v-for="(keyword, index) in info?.keywords" :key="index" class="m-0.75 cursor-pointer" type="info"
                effect="plain" @click="searchTag(keyword)"
              >
                {{ keyword }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
          <Attachment :can-download="info?.canDownload" :paper-id="info?.id" :attachments="attachments" />
        </FoldableCard>
      </el-col>
      <el-col :span="isSmallScreen ? 24 : 18" class="mt-3 lg:mt-0">
        <FoldableCard :can-fold="isSmallScreen" class="box-border h-full">
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

    <el-card v-if="attachments?.length">
      <Preview :attachment="attachments?.filter(a => a.isMainFile)[0]" full-height />
    </el-card>

    <el-card v-if="info?.comment">
      <template #header>
        教师评语
      </template>
      {{ info?.comment }}
    </el-card>
  </div>
</template>

<script setup lang="ts">
useHeadSafe({
  title: '论文信息',
});

const { $api } = useNuxtApp();
const route = useRoute();

const id = route.params.id.toString();
const isSmallScreen = useWindowWidth();

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
