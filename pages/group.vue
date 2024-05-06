<template>
  <el-card v-if="!classInfo">
    <el-result icon="info" title="用户无班级">
      <template #sub-title>
        请等待老师创建班级～
      </template>
      <template #extra>
        <el-button @click="navigateTo('/')">
          返回主页
        </el-button>
      </template>
    </el-result>
  </el-card>
  <template v-else>
    <div v-if="device.isMobileOrTablet" class="mb-2 text-sm!">
      <StateStep :class-info="classInfo" direction="horizontal" />
    </div>
    <div class="box-border flex flex-row gap-8 px-0">
      <div class="mb-22 w-full lg:mb-5 space-y-4">
        <el-card v-if="classInfo?.state === 'initialized'">
          <el-result
            icon="info"
            title="等待老师开启小组选择"
            sub-title="老师还没有开启小组选择，请耐心等待~"
          />
        </el-card>
        <JoinGroup v-else-if="classInfo?.state === 'selectGroup'" />
        <template v-else>
          <el-card v-if="!userStore.activeGroupIds.length">
            <el-result
              icon="error"
              title="错过了分组"
              sub-title="请联系老师将自己加入小组"
            />
          </el-card>
          <GroupInfo v-else :class-state="classInfo.state" />
        </template>
      </div>
      <div v-if="device.isDesktop" class="box-border h-content max-w-100px py-2">
        <StateStep :class-info="classInfo" direction="vertical" />
      </div>
    </div>
  </template>
</template>

<script lang="ts" setup>
useHeadSafe({
  title: '我的小组',
});

const { $api } = useNuxtApp();
const userStore = useUserStore();
const device = useDevice();

const { data: classInfo, suspense: classInfoSuspense } = useQuery({
  queryKey: ['class.info', { id: userStore.classId }],
  queryFn: () => userStore.classId ? $api.class.info.query({ id: userStore.classId }) : undefined,
});
await classInfoSuspense();

const { data: userInfo, suspense: userInfoSuspense } = useQuery({
  queryKey: ['user.profile', { id: userStore.userId }],
  queryFn: () => $api.user.profile.query({ id: userStore.userId }),
});
await userInfoSuspense();

onMounted(() => {
  if (userInfo) {
    userStore.activeGroupIds = userInfo.value?.groups.filter(x => !x.archived).map(x => x.id) ?? [];
    userStore.classId = userInfo.value?.classId ?? '';
  }
});
</script>
