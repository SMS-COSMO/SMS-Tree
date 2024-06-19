<template>
  <CompactCard class="mb-2 cursor-pointer lg:mb-2.5 hover:border-color-[#D4D7DE]! hover:bg-hover-bg!" @click="dialogVisible = true">
    <el-tag type="info" disable-transitions>
      <el-icon class="i-tabler:calendar-time" />
      {{ note.time.toLocaleDateString('zh-CN') }}
    </el-tag>
    <div class="mt-1">
      <el-text class="break-normal font-bold text-lg!">
        {{ note.title }}
      </el-text>
    </div>
  </CompactCard>

  <client-only>
    <el-dialog
      v-model="dialogVisible"
      title="活动记录"
    >
      <el-descriptions
        :column="1"
        :direction="device.isMobileOrTablet ? 'vertical' : 'horizontal'"
        size="large"
        border
      >
        <el-descriptions-item>
          <template #label>
            <div class="font-bold">
              活动主题
            </div>
          </template>
          <span class="text-[22px] font-bold">
            {{ note.title }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="font-bold">
              时间
            </div>
          </template>
          {{ note.time.toLocaleDateString('zh-CN') }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="font-bold">
              上次活动跟进
            </div>
          </template>
          <TiptapViewer :content="note.followUp" />
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="font-bold">
              新的讨论内容
            </div>
          </template>
          <TiptapViewer :content="note.newDiscussion" />
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="font-bold">
              活动笔记
            </div>
          </template>
          <TiptapViewer :content="note.content" />
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="font-bold">
              下次活动计划
            </div>
          </template>
          <TiptapViewer :content="note.plans" />
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="font-bold">
              反思
            </div>
          </template>
          <TiptapViewer :content="note.reflections" />
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button color="#15803d" @click="modifyDialogVisible = true">
          修改
        </el-button>
        <el-popconfirm width="200" title="确定要删除吗" @confirm="removeNote({ id: note.id })">
          <template #reference>
            <el-button type="danger" :loading="isPending">
              删除
            </el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-dialog>
    <el-dialog
      v-model="modifyDialogVisible"
      draggable align-center
      title="修改活动记录"
    >
      <NoteForm type="modify" :old-note="note" @reset="modifyDialogVisible = false" />
    </el-dialog>
  </client-only>
</template>

<script setup lang="ts">
defineProps<{ note: TNote }>();
const { $api } = useNuxtApp();
const device = useDevice();

const dialogVisible = ref(false);
const modifyDialogVisible = ref(false);

const queryClient = useQueryClient();
const { mutate: removeNote, isPending } = useMutation({
  mutationFn: $api.note.remove.mutate,
  onSuccess: (message) => {
    queryClient.invalidateQueries({ queryKey: ['group.info'] });
    useMessage({ message, type: 'success' });
  },
  onError: err => useErrorHandler(err),
});
</script>

<style>
.el-descriptions__label {
  width: 200px;
}
</style>
