<template>
  <div class="space-y-3 md:space-y-4">
    <div class="md:flex">
      <h1 class="hidden w-full self-center text-4xl md:block md:pr-[2em]">
        {{ info?.title }}
      </h1>
      <el-tag v-if="info?.isFeatured" type="success" size="large" class="ml-auto self-center">
        <el-icon class="i-tabler:star" />
        优秀
      </el-tag>
      <h1 class="w-full text-2xl md:hidden md:pr-[2em]">
        {{ info?.title }}
      </h1>
    </div>

    <div class="flex flex-col gap-4 md:flex-row">
      <div class="md:basis-1/4">
        <el-card class="box-border h-full">
          <template #header>
            <div class="flex items-center gap-2">
              <el-icon class="i-tabler:info-circle" />
              论文信息
              <BookmarkButton :paper-id="id" :bookmarked="info?.bookmarked" />
            </div>
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

    <el-card v-if="attachmentDocuments?.length">
      <template #header>
        <el-icon class="i-tabler:paperclip" />
        附件
      </template>
      <el-collapse>
        <el-collapse-item
          v-for="attachment in attachmentDocuments"
          :key="attachment.id"
        >
          <template #title>
            <div class="space-x-2">
              <span class="text-[15px]">
                {{ attachment.name }}
              </span>
            </div>
          </template>
          <Preview :attachment="attachment" />
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <el-card v-if="info?.comment">
      <template #header>
        <el-icon class="i-tabler:message" />
        评语
      </template>
      <TiptapViewer :content="info?.comment" />
    </el-card>

    <el-button v-if="allowModify" color="#15803d" @click="modifyDialogVisible = true">
      修改
    </el-button>
  </div>

  <client-only>
    <el-dialog
      v-if="allowModify"
      v-model="modifyDialogVisible"

      draggable align-center
      title="修改论文"
    >
      <PaperForm type="modify" :old-paper="oldPaper" :paper-id="id" @reset="modifyDialogVisible = false" />
    </el-dialog>
  </client-only>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  id: string;
  allowModify?: boolean;
}>(), {
  allowModify: false,
});

const { $api } = useNuxtApp();

const { data: info, suspense: infoSuspense } = useQuery({
  queryKey: ['paper.info', { id: props.id }],
  queryFn: () => $api.paper.info.query({ id: props.id }),
});
await infoSuspense();

const attachmentDocuments = info.value?.attachments?.filter(a => a.category !== 'paperDocument');
const oldPaper = computed<TPaperCreateSafeForm>(() => ({
  title: info.value?.title ?? '',
  abstract: info.value?.abstract ?? '',
  category: info.value?.category ?? -1,
  keywords: Array.from(info.value?.keywords ?? []), // Make keywords array not readonly
  canDownload: info.value?.canDownload ?? false,
  paperFile: [],
  attachments: [],
}));

function searchTag(keyword: string) {
  navigateTo({
    path: '/paper/list',
    query: { search: keyword },
  });
}

function searchCategory(code: number | undefined) {
  navigateTo({
    path: '/paper/list',
    query: { category: code },
  });
}

const modifyDialogVisible = ref(false);
</script>
