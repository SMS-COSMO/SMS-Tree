<template>
  <div class="mb-5 w-full space-y-4">
    <template v-if="classData">
      <el-row :gutter="16">
        <el-col :span="device.isMobileOrTablet ? 24 : 8">
          <el-card>
            <template #header>
              <el-icon><ElIconOfficeBuilding /></el-icon>
              {{ classData.className }}
            </template>
            <el-descriptions size="large" :column="2">
              <el-descriptions-item>
                <template #label>
                  <div class="text-[16px]!">
                    <el-icon><ElIconClock /></el-icon>
                    入学年份
                  </div>
                </template>
                <span class="text-[16px]!">
                  {{ classData.enterYear }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="text-[16px]!">
                    <el-icon><ElIconUser /></el-icon>
                    教师
                  </div>
                </template>
                <span class="space-x-2 text-[16px]!">
                  {{ classData.teacher?.username }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="text-[16px]!">
                    <el-icon><ElIconOperation /></el-icon>
                    状态
                  </div>
                </template>
                <span class="space-x-2 text-[16px]!">
                  <StateBadge size="large" :state="stateTable.find(x => x.value === classData?.state) ?? { label: '未知', type: 'info', value: '' }" />
                </span>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="text-[16px]!">
                    <el-icon><ElIconUser /></el-icon>
                    人数
                  </div>
                </template>
                <span class="space-x-2 text-[16px]!">
                  {{ classData.students.length }}
                </span>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
        <el-col :span="device.isMobileOrTablet ? 24 : 16">
          <el-card class="mt-2 h-full lg:mt-0">
            <template #header>
              班级状态
            </template>
            <div class="space-y-4">
              <StateStep :class-info="classData" direction="horizontal" show-archived />
              <div class="flex flex-row gap-2">
                <el-button-group class="mx-auto">
                  <el-button :disabled="classData.state === step[0]" @click="modifyState(-1)">
                    <el-icon><ElIconBack /></el-icon>
                    上一状态
                  </el-button>
                  <el-button :disabled="classData.state === step[step.length - 1]" @click="modifyState(1)">
                    下一状态
                    <el-icon><ElIconRight /></el-icon>
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-collapse-transition>
        <template v-if="classData.state === 'initialized'">
          <div class="flex flex-row gap-2">
            <el-input-number v-model="newGroupCount" :min="1" step-strictly :step="1" :max="15" />
            <el-button
              @click="createEmptyGroups({
                id: classData.id,
                amount: newGroupCount,
              })"
            >
              创建空白小组
            </el-button>
          </div>
        </template>
      </el-collapse-transition>
    </template>
    <template v-if="groupList">
      <div class="grid gap-2 lg:grid-cols-2 lg:gap-4">
        <template v-for="(group, index) in groupList" :key="group.id">
          <TeacherGroupInfo :info="group" :index="index + 1" />
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { stateTable } from '~/constants/class';
import type { TClassState } from '~/types';

const { $api } = useNuxtApp();
const device = useDevice();
useHeadSafe({
  title: '班级信息',
});
const queryClient = useQueryClient();

const { data: classData, suspense: classInfoSuspense } = useQuery({
  queryKey: ['classInfo', { id: useRoute().params.id.toString() }],
  queryFn: () => {
    return useTrpcAsyncData(
      () => $api.class.fullContent.query({ id: useRoute().params.id.toString() }),
    );
  },
});
await classInfoSuspense();

const { data: groupList, suspense: groupListSuspense } = useQuery({
  queryKey: ['groupList', { id: useRoute().params.id.toString() }],
  queryFn: () => {
    return useTrpcAsyncData(
      () => $api.group.list.query({ classId: useRoute().params.id.toString() }),
    );
  },
});
await groupListSuspense();

const step: TClassState[] = [
  'initialized', // 初始化
  'selectGroup', // 选择小组
  'thesisProposal', // 开题报告
  'concludingReport', // 结题报告
  'submitPaper', // 提交论文
  'archived', // 归档
];

const { mutate: modifyStateMutation } = useMutation({
  mutationFn: $api.class.modifyState.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['classInfo'] });
    queryClient.invalidateQueries({ queryKey: ['groupList'] });
  },
  onError: err => useErrorHandler(err),
});

const newGroupCount = ref(8);
const { mutate: createEmptyGroups } = useMutation({
  mutationFn: $api.class.initGroups.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['classInfo'] });
    queryClient.invalidateQueries({ queryKey: ['groupList'] });
    useElMessage({ type: 'success', message: '创建成功' });
  },
  onError: err => useErrorHandler(err),
});

function modifyState(delta: number) {
  if (!classData.value)
    return;
  modifyStateMutation({ id: classData.value.id, newState: step[step.indexOf(classData.value.state) + delta] });
}
</script>
