<template>
  <div class="mb-22 lg:mb-8 space-y-3 lg:space-y-4">
    <div class="lg:flex">
      <h1 v-if="!device.isMobileOrTablet" class="w-full text-3xl lg:pr-[2em] lg:text-4xl">
        {{ info?.title }}
      </h1>
      <el-space :size="10">
        <el-tag v-if="info?.isFeatured" type="success" size="large">
          <el-text style="color: var(--el-color-success);">
            <el-icon class="i-tabler:star" />
            优秀作业
          </el-text>
        </el-tag>
        <el-tag v-if="info?.score" size="large" :type="useScoreColor(info.score)" disable-transitions>
          <el-icon class="i-tabler:chart-bar" />
          <el-text :style="`color: var(--el-color-${useScoreColor(info.score)});`">
            分数：{{ info.score }}
          </el-text>
        </el-tag>
        <el-tag v-if="info?.canDownload" type="info" size="large" disable-transitions>
          <el-icon class="i-tabler:download" />
          <el-text style="color: var(--el-color-info);">
            下载次数：{{ info?.downloadCount ?? 0 }}
          </el-text>
        </el-tag>
      </el-space>
      <h1 v-if="device.isMobileOrTablet" class="w-full text-3xl lg:pr-[2em] lg:text-4xl">
        {{ info?.title }}
      </h1>
    </div>

    <el-row :gutter="20">
      <el-col :span="device.isMobileOrTablet ? 24 : 6">
        <FoldableCard :can-fold="device.isMobileOrTablet" class="box-border h-full">
          <template #header>
            <el-icon class="i-tabler:info-circle" />
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
          <Attachment :can-download="info?.canDownload" :paper-id="info?.id" :attachments="info?.attachments" />
        </FoldableCard>
      </el-col>
      <el-col :span="device.isMobileOrTablet ? 24 : 18" class="mt-3 lg:mt-0">
        <FoldableCard :can-fold="device.isMobileOrTablet" class="box-border h-full">
          <template #header>
            <el-icon class="i-tabler:align-box-left-top" />
            摘要
          </template>
          <div class="text-justify text-[15px] leading-normal lg:text-base">
            {{ info?.abstract }}
          </div>
        </FoldableCard>
      </el-col>
    </el-row>

    <template v-if="info?.attachments?.length && (info?.attachments?.findIndex(e => e.S3FileId) !== -1)">
      <Preview :attachment="info?.attachments?.filter(a => a.category === 'paperDocument')[0]" full-height />
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
useHeadSafe({
  title: '论文信息',
});

const { $api } = useNuxtApp();
const route = useRoute();

const id = route.params.id.toString();
const device = useDevice();

const { data: info, suspense: infoSuspense } = useQuery({
  queryKey: ['paperInfo', { id }],
  queryFn: () => $api.paper.info.query({ id }),
});
await infoSuspense();

function searchTag(keyword: string) {
  navigateTo({
    path: '/paper/list',
    query: {
      search: keyword,
    },
  });
}
</script>
