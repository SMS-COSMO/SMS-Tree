<template>
  <template v-if="!classInfo">
    <el-card>
      <template #header>
        <span class="text-xl font-bold">错误</span>
      </template>
      无法获取班级信息，请刷新页面重试
    </el-card>
  </template>
  <template v-else>
    <client-only>
      <div class="flex flex-row gap-8">
        <div class="w-full">
          <el-card v-if="classInfo.state === 'initialized'">
            <template #header>
              <span class="text-xl font-bold">等待老师开启小组选择</span>
            </template>
            老师还没有开启小组选择，请耐心等待~
          </el-card>
          <JoinGroup v-else-if="classInfo.state === 'selectGroup'" />
          <template v-else-if="classInfo.state === 'submitPaper'">
            <SubmitPaper v-if="!groupInfo?.papers.length" />
            <el-card v-else>
              <template #header>
                已上传论文
              </template>
              <PaperCard v-for="paper in groupInfo.papers" :key="paper.id" :paper="paper" />
            </el-card>
          </template>
        </div>
        <div class="box-border h-content max-w-80px py-2">
          <el-steps :active="step.indexOf(classInfo.state)" finish-status="wait" direction="vertical">
            <el-step :icon="ElIconRefresh" title="等待老师开放分组" />
            <el-step :icon="ElIconUser" title="选择小组" />
            <el-step :icon="ElIconUpload" title="提交论文" />
            <el-step :icon="ElIconCheck" title="论文查重" />
            <el-step :icon="ElIconSchool" title="教师批改" />
          </el-steps>
        </div>
      </div>
    </client-only>
  </template>
</template>

<script lang="ts" setup>
const { $api } = useNuxtApp();
const userStore = useUserStore();

const step = ['initialized', 'selectGroup', 'submitPaper'];

const [classInfo, userInfo, groupInfo] = await useTrpcAsyncData(() => Promise.all([
  $api.class.content.query({ id: userStore.classIds[0] }),
  $api.user.profile.query({ id: userStore.userId }),
  $api.group.content.query({ id: userStore.groupIds[0] }),
])) ?? [];

onMounted(() => {
  if (userInfo)
    userStore.groupIds = userInfo.groupIds;
});
</script>
