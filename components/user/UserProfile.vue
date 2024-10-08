<template>
  <el-card>
    <template #header>
      <el-icon class="i-tabler:id" />
      <span v-if="type === 'normal'">
        用户信息
      </span>
      <el-breadcrumb v-else separator="/" class="ml-2">
        <el-breadcrumb-item
          :to="{ path: '/admin/user/list' }"
        >
          学生管理
        </el-breadcrumb-item>
        <el-breadcrumb-item>
          {{ userInfo?.username }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </template>
    <el-descriptions
      :column="device.isMobileOrTablet ? 2 : 4"
      size="large" class="mb-[-16px]"
    >
      <el-descriptions-item>
        <template #label>
          <div class="text-[16px]!">
            <el-icon class="i-tabler:user" />
            姓名
          </div>
        </template>
        <span class="text-[16px]!">
          {{ userInfo?.username }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item v-if="(type === 'admin' || userId === userStore.userId) && userInfo?.schoolId">
        <template #label>
          <div class="text-[16px]!">
            <el-icon class="i-tabler:number" />
            学工号
          </div>
        </template>
        <span class="text-[16px]!">
          {{ userInfo?.schoolId }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item v-if="(type === 'admin' || userId === userStore.userId) && userInfo?.role === 'student' && userInfo?.className">
        <template #label>
          <div class="text-[16px]!">
            <el-icon class="i-tabler:school" />
            班级
          </div>
        </template>
        <span class="text-[16px]!">
          <template v-if="type === 'admin'">
            <el-link :href="`/admin/class/${userInfo?.classId}`">
              {{ userInfo?.className }}
            </el-link>
          </template>
          <template v-else>
            {{ userInfo?.className }}
          </template>
        </span>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="text-[16px]!">
            <el-icon class="i-tabler:shield-lock" />
            账号权限
          </div>
        </template>
        <el-tag>
          {{ roleName[userInfo?.role ?? 'student'] }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
  <el-card class="mt-5">
    <template #header>
      <el-icon class="i-tabler:files" />
      参与的论文
    </template>
    <div v-if="!papers?.length">
      <el-empty :image-size="130" description="暂无论文" />
    </div>
    <div v-else :class="papers?.length > 1 ? 'md:columns-2 md:gap-2.5' : ''">
      <template v-for="paper in papers" :key="paper?.id">
        <PaperCard v-if="paper" :paper="paper" show-abstract :is-admin="type === 'admin'" />
      </template>
    </div>
  </el-card>

  <el-button
    v-if="device.isMobileOrTablet && useUserStore().userId === userInfo?.id"
    class="mt-4 w-full"
    icon="i-tabler:logout"
    @click="useLogout"
  >
    退出登录
  </el-button>
</template>

<script lang="ts" setup>
const { userId, type } = defineProps<{
  userId: string;
  type: 'normal' | 'admin';
}>();

const { $api } = useNuxtApp();
const device = useDevice();
const userStore = useUserStore();

const roleName = {
  student: '学生',
  teacher: '老师',
  admin: '管理员',
};

const { data: userInfo, suspense } = useQuery({
  queryKey: ['user.profile', { id: userId }],
  queryFn: () => $api.user.profile.query({ id: userId }),
});
await suspense();

const papers = computed(() => userInfo.value?.groups.map(g => g.paper).filter(p => p));
</script>
