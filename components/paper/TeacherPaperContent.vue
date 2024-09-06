<template>
  <div class="space-y-3 md:space-y-4">
    <el-card v-if="isScoring" class="right-0 top-0 z-10 md:absolute">
      <div class="m-[-5px] flex flex-col gap-2 md:flex-row">
        <el-checkbox v-model="form.canDownload" border class="mr-0!">
          可下载
        </el-checkbox>
        <el-checkbox v-model="form.isFeatured" border class="mr-0!">
          选为优秀
        </el-checkbox>
        <el-popover
          title="添加评语（可留空）"
          :width="600"
          trigger="click"
          :hide-after="0"
          placement="bottom-start"
        >
          <template #reference>
            <el-badge is-dot :hidden="!form.comment">
              <el-button icon="i-tabler-plus" size="small">
                评语
              </el-button>
            </el-badge>
          </template>
          <TiptapEditor v-model="form.comment" />
        </el-popover>
        <el-tooltip content="完成批改" placement="top" :show-after="800">
          <el-button
            :loading="isPending"
            icon="i-tabler:check"
            size="small"
            class="ml-0!"
            @click="scoreMutation({ paperId: id, newPaper: form })"
          />
        </el-tooltip>
      </div>
    </el-card>

    <div class="md:flex">
      <h1 class="self-center pr-[2em] text-3xl" :class="[isScoring && 'max-w-[calc(100%-450px)]']">
        {{ info?.title }}
      </h1>
      <div v-if="!isScoring" class="ml-auto flex self-center gap-4">
        <el-tag v-if="info?.isFeatured" type="success" size="large">
          <el-icon class="i-tabler:star" />
          优秀
        </el-tag>
        <el-tag v-if="info?.isPublic !== undefined && !info.isPublic" size="large" type="danger">
          <el-icon class="i-tabler:pencil" />
          待批改
        </el-tag>
        <el-tag size="large" class="cursor-pointer" @click="modifyDialogVisible = true">
          <el-icon class="i-tabler:edit" />
          修改论文
        </el-tag>
        <el-popconfirm
          v-if="info"
          title="确定要删除论文吗？"
          width="200"
          confirm-button-type="danger"
          hide-icon
          @confirm="removePaper({ id: info.id })"
        >
          <template #reference>
            <el-tag type="danger" size="large" class="cursor-pointer">
              <el-icon class="i-tabler:trash" />
              删除论文
            </el-tag>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <div class="flex flex-col gap-4 md:flex-row">
      <div class="md:basis-1/4">
        <el-card class="box-border h-full">
          <template #header>
            <div class="flex items-center gap-2">
              <el-icon class="i-tabler:info-circle" />
              论文信息
              <div class="ml-auto flex gap-2">
                <BookmarkButton :paper-id="id" :bookmarked="info?.bookmarked" />
                <ShareButton />
              </div>
            </div>
          </template>
          <el-descriptions :column="1" direction="vertical">
            <el-descriptions-item label="班级">
              <el-link :href="`/admin/class/${info?.class?.id}`">
                {{ info?.class?.className }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item v-if="info?.authors" label="作者">
              <GroupMembers :authors="info?.authors" :leader="info?.leader" type="link" class="inline" is-admin />
            </el-descriptions-item>
            <el-descriptions-item label="提交时间">
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
          <div class="text-justify text-[15px] leading-normal md:text-base">
            {{ info?.abstract }}
          </div>
        </el-card>
      </div>
    </div>

    <h3>
      论文文件
      <el-tag v-if="paperDocuments?.length" class="ml-2" effect="plain" type="info">
        {{ paperDocuments[0]?.name }}
      </el-tag>
    </h3>
    <el-empty
      v-if="!paperDocuments?.length"
      description="无论文文件"
      class="py-0!"
    />
    <Preview
      v-for="attachment in paperDocuments"
      v-else
      :key="attachment.id"
      :attachment="attachment"
      full-height
      admin
    />
    <el-card v-if="attachmentDocuments?.length">
      <template #header>
        <el-icon class="i-tabler:pin" />
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
          <Preview :attachment="attachment" admin />
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
  </div>

  <client-only>
    <el-dialog
      v-model="modifyDialogVisible"
      draggable
      align-center
      title="修改论文"
    >
      <PaperForm type="modify" :old-paper="oldPaper" :paper-id="id" is-admin @reset="modifyDialogVisible = false" />
    </el-dialog>
  </client-only>
</template>

<script setup lang="ts">
const { id, isScoring } = defineProps<{
  id: string;
  isScoring: boolean;
}>();

const { $api } = useNuxtApp();

const { data: info, suspense } = useQuery({
  queryKey: ['paper.infoWithClass', { id }],
  queryFn: () => $api.paper.infoWithClass.query({ id }),
});
await suspense();

const oldPaper = computed<TPaperCreateSafeForm>(() => ({
  title: info.value?.title ?? '',
  abstract: info.value?.abstract ?? '',
  category: info.value?.category ?? -1,
  keywords: Array.from(info.value?.keywords ?? []), // Make keywords array not readonly
  canDownload: info.value?.canDownload ?? false,
  paperFile: [],
  attachments: [],
}));

const paperDocuments = info.value?.attachments?.filter(a => a.category === 'paperDocument');
const attachmentDocuments = info.value?.attachments?.filter(a => a.category !== 'paperDocument');

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

const form = reactive({
  comment: undefined,
  isFeatured: false,
  canDownload: true,
});

const queryClient = useQueryClient();
const { mutate: scoreMutation, isPending } = useMutation({
  mutationFn: $api.paper.score.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['paper.scoreList'] });
  },
  onError: err => useErrorHandler(err),
});

const { mutate: removePaper } = useMutation({
  mutationFn: $api.paper.remove.mutate,
  onSuccess: () => {
    useRouterBack();
    queryClient.invalidateQueries({ queryKey: ['class.info'] });
    queryClient.invalidateQueries({ queryKey: ['group.list'] });
    queryClient.invalidateQueries({ queryKey: ['paper.scoreList'] });
    queryClient.invalidateQueries({ queryKey: ['paper.list'] });
    useMessage({ message: '删除成功', type: 'success' });
  },
  onError: err => useErrorHandler(err),
});

const modifyDialogVisible = ref(false);
</script>
