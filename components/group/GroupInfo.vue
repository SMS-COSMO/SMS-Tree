<template>
  <el-card>
    <template #header>
      <el-icon class="i-tabler:info-circle" />
      小组信息
    </template>
    <el-descriptions
      :column="device.isMobileOrTablet ? 1 : 2"
      size="large"
    >
      <el-descriptions-item>
        <template #label>
          <div class="text-[16px]!">
            <el-icon class="i-tabler:user" />
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
          <div class="text-[16px]!">
            <el-icon class="i-tabler:users" />
            小组成员
          </div>
        </template>
        <span class="space-x-2 text-[16px]!">
          <GroupMembers :authors="info?.members" :leader="info?.leader" type="link" class="inline" />
        </span>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions
      :column="1"
      size="large" class="mb-[-16px] max-w-full!"
    >
      <el-descriptions-item>
        <template #label>
          <div class="text-[15px]!">
            <el-icon class="i-tabler:notebook" />
            课题名
            <el-popover
              v-if="info"
              placement="bottom"
              title="修改课题名"
              :width="300"
              trigger="click"
            >
              <template #reference>
                <el-link icon="i-tabler:edit" class="ml-2 text-[16px]!">
                  修改
                </el-link>
              </template>
              <el-input v-model="newProjectName" @blur="edit = false">
                <template #append>
                  <el-button :loading="isPending" @click="modifyProjectName({ groupId: info!.id, newProjectName })">
                    <el-icon class="i-tabler:check" />
                  </el-button>
                </template>
              </el-input>
            </el-popover>
          </div>
        </template>
        <span class="text-[16px]!">
          {{ info?.projectName ?? '待填写' }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="mb-[-12px] text-[16px]!">
            <el-icon class="i-tabler:clipboard" />
            活动记录
          </div>
        </template>
        <template v-for="note in info?.notes" :key="note.id">
          <NoteCard :note="note" />
        </template>
        <NewNote />
      </el-descriptions-item>
      <el-descriptions-item v-if="info?.reports?.length">
        <template #label>
          <div class="mb-[-12px] text-[16px]!">
            <el-icon class="i-tabler:presentation" />
            报告
          </div>
        </template>
        <div :class="info?.reports?.length ?? 0 > 1 ? 'lg:columns-2 lg:gap-2.5' : ''">
          <template v-for="report in info?.reports" :key="report.id">
            <ReportCard :report="report" />
          </template>
        </div>
      </el-descriptions-item>
      <el-descriptions-item v-if="info?.papers?.length">
        <template #label>
          <div class="mb-[-12px] text-[16px]!">
            <el-icon class="i-tabler:file-text" />
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

const props = defineProps<{ info?: TGroupContent }>();
const { $api } = useNuxtApp();
const device = useDevice();

const edit = ref(false);
const newProjectName = ref();

const queryClient = useQueryClient();
const { mutate: modifyProjectName, isPending } = useMutation({
  mutationFn: $api.group.modifyProjectName.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['groupInfo'] });
    useElMessage({ message: '修改成功', type: 'success' });
  },
  onError: err => useErrorHandler(err),
});

onMounted(() => {
  newProjectName.value = props.info?.projectName;
});
</script>
