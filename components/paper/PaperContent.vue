<template>
  <div class="space-y-3 md:space-y-4">
    <div class="md:flex">
      <h1 class="hidden w-full text-3xl md:block md:pr-[2em] md:text-4xl">
        {{ info?.title }}
      </h1>
      <el-space :size="10">
        <el-tag v-if="info?.isFeatured" type="success" size="large">
          <el-icon class="i-tabler:star" />
          优秀
        </el-tag>
        <el-tag v-if="info?.score" size="large" :type="useScoreColor(info.score)">
          <el-icon class="i-tabler:chart-bar" />
          分数：{{ info.score }}
        </el-tag>
      </el-space>
      <h1 class="w-full text-3xl md:hidden md:pr-[2em] md:text-4xl">
        {{ info?.title }}
      </h1>
    </div>

    <div class="flex flex-col gap-4 md:flex-row">
      <div class="md:basis-1/4">
        <el-card class="box-border h-full">
          <template #header>
            <el-icon class="i-tabler:info-circle" />
            论文信息
          </template>
          <el-descriptions :column="1" direction="vertical">
            <el-descriptions-item v-if="info?.authors" label="作者">
              <GroupMembers :authors="info?.authors" :leader="info?.leader" type="link" class="inline" />
            </el-descriptions-item>
            <el-descriptions-item label="发布时间">
              {{ info?.createdAt.toLocaleDateString('zh-CN') }}
            </el-descriptions-item>
            <el-descriptions-item label="分类">
              <el-tag effect="light" class="cursor-pointer" type="warning" @click="searchCategory(info?.category)">
                {{ getCategoryName(info?.category) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="info?.keywords.length" label="关键词">
              <span class="flex flex-wrap gap-1">
                <el-tag
                  v-for="(keyword, index) in info?.keywords" :key="index" class="cursor-pointer" type="info"
                  effect="plain" @click="searchTag(keyword)"
                >
                  {{ keyword }}
                </el-tag>
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
      <div class="md:basis-3/4">
        <el-card class="box-border h-full">
          <template #header>
            <el-icon class="i-tabler:align-box-left-top" />
            摘要
          </template>
          <div class="whitespace-break-spaces text-justify text-[15px] leading-normal md:text-base">
            {{ info?.abstract }}
          </div>
        </el-card>
      </div>
    </div>

    <template v-if="info?.attachments?.length && (info?.attachments?.findIndex(e => e.S3FileId) !== -1)">
      <Preview :attachment="info?.attachments?.filter(a => a.category === 'paperDocument')[0]" full-height />
    </template>

    <el-card v-if="info?.comment">
      <template #header>
        <el-icon class="i-tabler:message" />
        教师评语
      </template>
      <TiptapViewer :content="info?.comment" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  id: string;
}>();

const { $api } = useNuxtApp();

const { data: info, suspense: infoSuspense } = useQuery({
  queryKey: ['paper.info', { id: props.id }],
  queryFn: () => $api.paper.info.query({ id: props.id }),
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

function searchCategory(code: number | undefined) {
  navigateTo({
    path: '/paper/list',
    query: {
      category: code,
    },
  });
}
</script>
