<template>
  <StateStep v-if="device.isMobileOrTablet" :class-info="classInfo" direction="horizontal" class="mb-2 text-sm!" />
  <div class="box-border flex flex-row gap-8 px-0">
    <div class="mb-22 w-full lg:mb-5 space-y-4">
      <el-card v-if="classInfo?.state === 'initialized'">
        <template #header>
          <span class="text-xl font-bold">等待老师开启小组选择</span>
        </template>
        老师还没有开启小组选择，请耐心等待~
      </el-card>
      <JoinGroup v-else-if="classInfo?.state === 'selectGroup'" />
      <template v-else>
        <GroupInfo v-if="groupInfo" :info="groupInfo" />
        <template v-if="classInfo?.state === 'submitPaper' && groupInfo?.papers !== undefined">
          <SubmitPaper v-if="!groupInfo?.papers.length" />
          <el-card v-else>
            <el-result
              icon="success"
              title="论文已提交"
              sub-title="等待老师批改论文"
            />
          </el-card>
        </template>
        <template v-else-if="classInfo?.state === 'thesisProposal'">
          <SubmitReport
            v-if="!groupInfo?.reports?.some(x => x.category === 'thesisProposal')"
            category="thesisProposal"
          />
          <el-card v-else>
            <el-result
              icon="success"
              title="开题报告已提交"
              sub-title="等待老师反馈"
            />
          </el-card>
        </template>
        <template v-else-if="classInfo?.state === 'concludingReport'">
          <SubmitReport
            v-if="!groupInfo?.reports?.some(x => x.category === 'concludingReport')"
            category="concludingReport"
          />
          <el-card v-else>
            <el-result
              icon="success"
              title="结题报告已提交"
              sub-title="等待老师反馈"
            />
          </el-card>
        </template>
      </template>
    </div>
    <div v-if="device.isDesktop" class="box-border h-content max-w-80px py-2">
      <StateStep :class-info="classInfo" direction="vertical" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useQuery } from '@tanstack/vue-query';

useHeadSafe({
  title: '我的小组',
});

const { $api } = useNuxtApp();
const userStore = useUserStore();
const device = useDevice();

const [classInfo, userInfo] = await useTrpcAsyncData(() => Promise.all([
  $api.class.content.query({ id: userStore.classId }),
  $api.user.profileSafe.query({ id: userStore.userId }),
])) ?? [];

const { data: groupInfo, suspense: groupInfoSuspense } = useQuery({
  queryKey: ['groupInfo', { id: userStore.groupIds[0] }],
  queryFn: () => {
    if (userStore.groupIds[0])
      return $api.group.content.query({ id: userStore.groupIds[0] });
  },
});
await groupInfoSuspense();

onMounted(() => {
  if (userInfo)
    userStore.groupIds = userInfo.groups.map(x => x.id);
});
</script>
