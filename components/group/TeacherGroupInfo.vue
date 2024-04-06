<template>
  <el-card>
    <template #header>
      <el-tag type="info" effect="plain" class="mr-1">
        小组 {{ index }}
      </el-tag>
      {{ info?.projectName ?? '暂无课题名' }}
      <el-popconfirm
        v-if="info"
        title="确定要删除小组吗"
        width="200"
        confirm-button-type="danger"
        hide-icon
        @confirm="removeGroup({ id: info?.id })"
      >
        <template #reference>
          <el-link :icon="ElIconDelete" type="danger" class="float-right">
            删除
          </el-link>
        </template>
      </el-popconfirm>
    </template>
    <el-descriptions
      :column="1"
      size="large"
    >
      <el-descriptions-item>
        <template #label>
          <div class="text-[16px]!">
            <el-icon>
              <ElIconUser />
            </el-icon>
            组长
          </div>
        </template>
        <span class="text-[16px]!">
          <el-link :href="`/user/${info?.leader?.id}`">
            {{ info?.leader?.username }}
          </el-link>
        </span>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="mb-[-12px] text-[16px]!">
            <el-icon>
              <ElIconUser />
            </el-icon>
            小组成员
          </div>
        </template>
        <el-table :data="info?.members">
          <el-table-column prop="username" label="姓名">
            <template #default="scope">
              <span
                :class="`${info?.leader?.id === scope.row.id ? 'font-bold' : ''} cursor-pointer`"
                @click="navigateTo(`/admin/user/${scope.row.id}`)"
              >
                {{ scope.row.username }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="schoolId" label="学号" />
        </el-table>
      </el-descriptions-item>
      <el-descriptions-item v-if="info?.notes?.length">
        <template #label>
          <div class="mb-[-12px] text-[16px]!">
            <el-icon>
              <ElIconEditPen />
            </el-icon>
            活动记录
          </div>
        </template>
        <div :class="(info?.notes?.length ?? 0) > 1 ? 'grid grid-cols-2 gap-2' : ''">
          <template v-for="note in info?.notes" :key="note.id">
            <NoteCard :note="note" />
          </template>
        </div>
      </el-descriptions-item>
      <el-descriptions-item v-if="info?.reports?.length">
        <template #label>
          <div class="mb-[-12px] text-[16px]!">
            <el-icon>
              <ElIconDataBoard />
            </el-icon>
            报告
          </div>
        </template>
        <div :class="(info?.reports?.length ?? 0) > 1 ? 'grid grid-cols-2 gap-2' : ''">
          <template v-for="report in info?.reports" :key="report.id">
            <ReportCard :report="report" />
          </template>
        </div>
      </el-descriptions-item>
      <el-descriptions-item v-if="info?.papers?.length">
        <template #label>
          <div class="mb-[-12px] text-[16px]!">
            <el-icon>
              <ElIconDocument />
            </el-icon>
            论文
          </div>
        </template>
        <div :class="info?.papers?.length > 1 ? 'lg:columns-2 lg:gap-2.5' : ''">
          <template v-for="paper in info.papers" :key="paper.id">
            <PaperCard :paper="paper" :show-authors="false" />
          </template>
        </div>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { TGroupContent } from '~/types';

const props = defineProps<{
  info?: TGroupContent;
  index: number;
}>();

const { $api } = useNuxtApp();
const queryClient = useQueryClient();

const newProjectName = ref();

const { mutate: removeGroup } = useMutation({
  mutationFn: $api.group.remove.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['groupList'] });
  },
  onError: err => useErrorHandler(err),
});

onMounted(() => {
  newProjectName.value = props.info?.projectName;
});
</script>
