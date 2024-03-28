<template>
  <client-only>
    <div class="box-border flex flex-row gap-8 px-0">
      <div class="mb-5 w-full space-y-4">
        <el-card v-if="classInfo?.state === 'initialized'">
          <template #header>
            <span class="text-xl font-bold">等待老师开启小组选择</span>
          </template>
          老师还没有开启小组选择，请耐心等待~
        </el-card>
        <JoinGroup v-else-if="classInfo?.state === 'selectGroup'" />
        <template v-else>
          <GroupInfo :info="groupInfo" />
          <template v-if="classInfo?.state === 'submitPaper' && groupInfo?.papers">
            <SubmitPaper v-if="!groupInfo?.papers.length" />
            <el-card v-else>
              <el-result
                icon="success"
                title="论文已提交"
                sub-title="等待老师批改论文"
              />
            </el-card>
          </template>
        </template>
      </div>
      <div class="box-border h-content max-w-80px py-2">
        <el-steps :active="step.indexOf(classInfo?.state ?? '')" finish-status="wait" direction="vertical">
          <el-step :icon="ElIconClock" title="等待老师开放分组" />
          <el-step :icon="ElIconUser" title="选择小组" />
          <el-step :icon="ElIconUpload" title="提交论文" />
          <el-step :icon="ElIconCheck" title="论文查重" />
          <el-step :icon="ElIconSchool" title="教师批改" />
        </el-steps>
      </div>
    </div>
    <template #fallback>
      <el-card>
        <el-skeleton :rows="10" animated />
      </el-card>
    </template>
  </client-only>
</template>

<script lang="ts" setup>
import { useQuery } from '@tanstack/vue-query';

const { $api } = useNuxtApp();
const userStore = useUserStore();

const step = ['initialized', 'selectGroup', 'submitPaper'];

const [classInfo, userInfo] = await useTrpcAsyncData(() => Promise.all([
  $api.class.content.query({ id: userStore.classIds[0] }),
  $api.user.profile.query({ id: userStore.userId }),
])) ?? [];

const { data: groupInfo, suspense: groupInfoSuspense } = useQuery({
  queryKey: ['groupInfo'],
  queryFn: () => useTrpcAsyncData(() => $api.group.content.query({ id: userStore.groupIds[0] })),
});
await groupInfoSuspense();

onMounted(() => {
  if (userInfo)
    userStore.groupIds = userInfo.groupIds;
});
</script>
