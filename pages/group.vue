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
    <div class="mb-2 md:hidden text-sm!">
      <StateStep :class-info="classInfo" direction="horizontal" />
    </div>
    <div class="box-border flex flex-row gap-8 px-0">
      <div class="w-full space-y-4">
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
      <div class="sticky top-20 box-border hidden h-content max-w-[150px] min-w-[100px] pt-2 md:block">
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

const enabled = computed(() => userStore.classId !== undefined && userStore.classId.length !== 0);
const { data: classInfo } = useQuery({
  queryKey: ['class.info', { id: userStore.classId }],
  queryFn: () => $api.class.info.query({ id: userStore.classId }),
  enabled,
});

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
