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
    <el-card v-if="classInfo.state === 'initialized'">
      <template #header>
        <span class="text-xl font-bold">等待老师开启小组选择</span>
      </template>
      老师还没有开启小组选择，请耐心等待~
    </el-card>
    <JoinGroup v-else-if="classInfo.state === 'selectGroup'" />
    <SubmitPaper v-else-if="classInfo.state === 'submitPaper'" />
  </template>
</template>

<script lang="ts" setup>
const { $api } = useNuxtApp();
const userStore = useUserStore();

const [classInfo, userInfo] = await useTrpcAsyncData(() => Promise.all([
  $api.class.content.query({ id: userStore.classIds[0] }),
  $api.user.profile.query({ id: userStore.userId }),
])) ?? [];

onMounted(() => {
  if (userInfo)
    userStore.groupIds = userInfo.groupIds;
});
</script>
