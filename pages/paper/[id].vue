<template>
  <el-backtop :right="isSmallScreen ? 30 : 100" :bottom="100" />

  <div class="mb-3 lg:flex">
    <h1 class="w-full text-2xl lg:pr-[2em] lg:text-4xl">
      <el-tag v-if="content?.isFeatured" type="success" size="large">
        <el-text style="color: var(--el-color-success);">
          <el-icon>
            <ElIconStar />
          </el-icon>
          优秀作业
        </el-text>
      </el-tag>
      {{ content?.title }}
    </h1>
    <el-space :size="20" class="mb-2 lg:mb-0">
      <el-statistic :value="content?.rate">
        <template #title>
          分数
        </template>
      </el-statistic>
      <el-divider direction="vertical" class="h-10!" />
      <el-statistic :value="content?.downloadCount">
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
          论文信息
        </template>
        <el-descriptions :column="1">
          <el-descriptions-item label="作者">
            <GroupMembers :authors="content?.authors" :leader-id="content?.leader?.id" type="link" class="inline" />
          </el-descriptions-item>
          <el-descriptions-item label="发布时间">
            {{ content?.createdAt.toLocaleDateString('zh-CN') }}
          </el-descriptions-item>
          <el-descriptions-item label="关键词">
            <el-tag
              v-for="(keyword, index) in content?.keywords" :key="index" class="m-0.75 cursor-pointer" type="info"
              effect="plain" @click="searchTag(keyword)"
            >
              {{ keyword }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <Attachment :can-download="content?.canDownload" :paper-id="content?.id" :attachments="attachments" />
      </FoldableCard>
    </el-col>
    <el-col :span="isSmallScreen ? 24 : 18" :class="isSmallScreen ? 'mt-4' : ''">
      <FoldableCard :can-fold="isSmallScreen" class="box-border h-full">
        <template #header>
          摘要
        </template>
        <div class="text-justify text-[15px] leading-normal lg:text-base">
          {{ content?.abstract }}
        </div>
      </FoldableCard>
    </el-col>
  </el-row>

  <el-card v-if="attachments?.length" class="mt-5">
    <Preview :attachment="attachments?.filter(a => a.isMainFile)[0]" full-height />
  </el-card>

  <el-card class="mb-22 mt-5 lg:mb-5">
    <template #header>
      教师评语
    </template>
    {{ content?.comment }}
  </el-card>
</template>

<script setup lang="ts">
import Attachment from '~/components/paper/Attachment.vue';

useHeadSafe({
  title: '论文信息',
});

const { $api } = useNuxtApp();
const route = useRoute();

const id = route.params.id.toString();
const isSmallScreen = useWindowWidth();

const [content, attachments] = await useTrpcAsyncData(() => Promise.all([
  $api.paper.contentWithAuthor.query({ id }),
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
