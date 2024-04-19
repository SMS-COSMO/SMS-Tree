<template>
  <div class="space-y-3 lg:space-y-4">
    <el-card class="floating absolute right-0 top-0 z-10">
      <div class="m-[-5px] flex flex-row gap-2">
        <el-tooltip content="是否选为优秀作业" placement="top" :show-after="800">
          <el-switch
            v-model="form.isFeatured" active-text="优秀" inactive-text="普通" inline-prompt
            size="large"
            class="h-[34px]!"
            style="--el-switch-on-color: #146E3C; --el-switch-off-color: #409EFF;"
          />
        </el-tooltip>
        <el-tooltip content="等级" placement="top" :show-after="800">
          <el-radio-group v-model="form.score">
            <el-radio-button label="A" value="A" />
            <el-radio-button label="B" value="B" />
            <el-radio-button label="C" value="C" />
            <el-radio-button label="D" value="D" />
          </el-radio-group>
        </el-tooltip>
        <el-popover
          title="添加评语（可留空）"
          :width="400"
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
          <el-input
            v-model="form.comment"
            :autosize="{ minRows: 3, maxRows: 10 }"
            type="textarea"
          />
        </el-popover>
        <el-tooltip content="完成批改" placement="top" :show-after="800">
          <el-button
            :loading="isPending"
            icon="i-tabler:check" size="small"
            class="ml-0!"
            @click="scoreMutation({ paperId: id, newPaper: form })"
          />
        </el-tooltip>
      </div>
    </el-card>

    <h1 class="max-w-[calc(100%-450px)] min-h-15 w-full pr-[2em] text-3xl">
      {{ info?.title }}
    </h1>

    <el-row :gutter="20">
      <el-col :span="7">
        <el-card class="box-border h-full">
          <template #header>
            <el-icon class="i-tabler:info-circle" />
            论文信息
          </template>
          <el-descriptions :column="1">
            <el-descriptions-item label="班级">
              <el-link :href="`/admin/class/${info?.class?.id}`">
                {{ info?.class?.className }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item v-if="info?.authors" label="作者">
              <GroupMembers :authors="info?.authors" :leader="info?.leader" type="link" class="inline" />
            </el-descriptions-item>
            <el-descriptions-item label="提交时间">
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
        </el-card>
      </el-col>
      <el-col :span="17" class="mt-3 lg:mt-0">
        <el-card class="box-border h-full">
          <template #header>
            <el-icon class="i-tabler:align-box-left-top" />
            摘要
          </template>
          <div class="text-justify text-[15px] leading-normal lg:text-base">
            {{ info?.abstract }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <template v-if="info?.attachments?.length && (info?.attachments?.findIndex(e => e.S3FileId) !== -1)">
      <Preview :attachment="info?.attachments?.filter(a => a.category === 'paperDocument')[0]" full-height />
    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  id: string;
}>();

const { $api } = useNuxtApp();

const info = await useTrpcAsyncData(() => $api.paper.infoWithClass.query({ id: props.id }));

function searchTag(keyword: string) {
  navigateTo({
    path: '/paper/list',
    query: {
      search: keyword,
    },
  });
}

const form = reactive({
  comment: undefined,
  score: undefined,
  isFeatured: false,
});

const queryClient = useQueryClient();
const { mutate: scoreMutation, isPending } = useMutation({
  mutationFn: $api.paper.score.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['scoringQueue'] });
  },
  onError: err => useErrorHandler(err),
});
</script>

<style scoped>
.floating {
  box-shadow: var(--el-box-shadow-light) !important;
}
</style>
