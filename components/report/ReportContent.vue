<template>
  <el-tag v-if="isAdmin && report.read" type="success" class="mb-2 font-bold" size="large">
    <el-icon class="i-tabler:check" />
    已阅
  </el-tag>
  <div class="mb-2 text-lg font-bold">
    创建时间
  </div>
  <el-tag type="info" disable-transitions>
    {{ report.createdAt.toLocaleDateString('zh-CN') }}
  </el-tag>
  <div class="mb-2 mt-4 text-lg font-bold">
    报告文档
  </div>
  <Preview :attachment="reportDocument" />
  <div class="mb-2 mt-4 text-lg font-bold">
    报告PPT
  </div>
  <Preview :attachment="reportPresentation" />
  <template v-if="isAdmin">
    <div class="mb-2 mt-4 text-lg font-bold">
      批注
    </div>
    <TiptapEditor v-if="!report.read" v-model="comment" />
    <el-card v-else>
      <TiptapViewer :content="report.comment" />
    </el-card>
  </template>

  <div class="mt-2">
    <el-button v-if="!isAdmin" color="#15803d" @click="modifyDialogVisible = true">
      修改
    </el-button>
    <el-button
      v-else-if="!report.read"
      color="#15803d"
      @click="commentMutate({ id: report.id, comment, read: true }); modifyDialogVisible = false"
    >
      完成批阅
    </el-button>
    <el-button v-else color="#15803d" @click="modifyCommentVisible = true">
      修改批注
    </el-button>
  </div>

  <client-only>
    <el-dialog
      v-model="modifyDialogVisible"
      draggable
      align-center
      title="修改报告"
    >
      <ReportForm :category="report.category" type="modify" :report-id="report.id" />
    </el-dialog>

    <el-dialog
      v-model="modifyCommentVisible"
      title="修改批注"
      draggable
      align-center
      width="700"
    >
      <TiptapEditor v-model="comment" />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="modifyCommentVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="commentMutate({ id: report.id, comment, read: true }); modifyCommentVisible = false">
            修改
          </el-button>
        </div>
      </template>
    </el-dialog>
  </client-only>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  report: TReport;
  isAdmin?: boolean;
}>(), {
  isAdmin: false,
});

const { $api } = useNuxtApp();
const reportDocument = computed(() => props.report?.attachments?.filter(a => a.category === 'reportDocument')[0]);
const reportPresentation = computed(() => props.report?.attachments?.filter(a => a.category === 'reportPresentation')[0]);

const comment = ref(props.report.comment);
const modifyDialogVisible = ref(false);
const modifyCommentVisible = ref(false);

const queryClient = useQueryClient();
const { mutate: commentMutate } = useMutation({
  mutationFn: $api.report.modify.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['class.info'] });
    useMessage({ message: '批阅成功', type: 'success' });
  },
  onError: err => useErrorHandler(err),
});
</script>
