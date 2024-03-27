<template>
  <el-card class="mb-2 cursor-pointer lg:mb-2.5 hover:border-color-[#D4D7DE]! hover:bg-hover-bg!" @click="dialogVisible = true">
    <el-row class="gap-[6px]">
      <el-tag type="info" disable-transitions>
        {{ note.time.toLocaleDateString('zh-CN') }}
      </el-tag>
    </el-row>
    <div class="mt-1">
      <el-text class="break-normal font-bold text-xl!">
        {{ note.title }}
      </el-text>
    </div>
  </el-card>

  <client-only>
    <el-dialog
      v-model="dialogVisible"
      title="活动记录"
      width="500"
    >
      <el-descriptions
        :column="1"
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
          {{ note.followUp }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="font-bold">
              新的讨论内容
            </div>
          </template>
          {{ note.newDiscussion }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="font-bold">
              活动笔记
            </div>
          </template>
          {{ note.content }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="font-bold">
              下次活动计划
            </div>
          </template>
          {{ note.plans }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="font-bold">
              反思
            </div>
          </template>
          {{ note.reflections }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="modifyDialogVisible = true">
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
      align-center
      draggable
      title="修改活动记录"
    >
      <NoteForm type="modify" :old-note="note" />
    </el-dialog>
  </client-only>
</template>

<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { TRawNote } from '~/server/db/db';

defineProps<{ note: TRawNote }>();
const { $api } = useNuxtApp();

const dialogVisible = ref(false);
const modifyDialogVisible = ref(false);

const queryClient = useQueryClient();
const { mutate: removeNote, isPending } = useMutation({
  mutationFn: $api.note.remove.mutate,
  onSuccess: (message) => {
    queryClient.invalidateQueries({ queryKey: ['groupInfo'] });
    ElMessage({ message, type: 'success', showClose: true });
  },
  onError: err => useErrorHandler(err),
});
</script>

<style>
.el-descriptions__label {
  width: 200px;
}
</style>
