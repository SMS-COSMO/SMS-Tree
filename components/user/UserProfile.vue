<template>
  <el-card>
    <template #header>
      <el-icon class="i-tabler:user-circle" />
      用户信息
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
          {{ info?.username }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item v-if="type === 'admin' && info?.schoolId">
        <template #label>
          <div class="text-[16px]!">
            <el-icon class="i-tabler:number" />
            学工号
          </div>
        </template>
        <span class="text-[16px]!">
          {{ info?.schoolId }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item v-if="info?.role === 'student'">
        <template #label>
          <div class="text-[16px]!">
            <el-icon class="i-tabler:school" />
            班级
          </div>
        </template>
        <span class="text-[16px]!">
          <template v-if="type === 'admin'">
            <el-link :href="`/admin/class/${info?.classId}`">
              {{ info?.className }}
            </el-link>
          </template>
          <template v-else>
            {{ info?.className }}
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
          {{ roleName[info?.role ?? 'student'] }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
  <FoldableCard class="mt-5">
    <template #header>
      <el-icon class="i-tabler:files" />
      参与的论文
    </template>
    <div v-if="!papers?.length">
      <el-empty :image-size="130" description="暂无论文" />
    </div>
    <div v-else :class="papers?.length > 1 ? 'lg:columns-2 lg:gap-2.5' : ''">
      <template v-for="paper in papers" :key="paper.id">
        <PaperCard v-if="paper" :paper="paper" show-abstract :is-admin="type === 'admin'" />
      </template>
    </div>
  </FoldableCard>

  <el-button
    v-if="device.isMobileOrTablet && useUserStore().userId === info?.id"
    class="mt-4 w-full"
    @click="useLogout"
  >
    退出登陆
  </el-button>
</template>

<script lang="ts" setup>
import type { TRawPaper } from '~/server/db/db';

const props = defineProps<{
  userId: string;
  type: 'normal' | 'admin';
}>();

const { $api } = useNuxtApp();

const device = useDevice();

const roleName = {
  student: '学生',
  teacher: '老师',
  admin: '管理员',
};

const { info, papers } = await useTrpcAsyncData(async () => {
  const info = props.type === 'admin'
    ? await $api.user.profile.query({ id: props.userId })
    : await $api.user.profileSafe.query({ id: props.userId }) as TUserProfile;

  let papers: (Partial<TRawPaper> | undefined)[] = [];
  for (const group of (info?.groups ?? []))
    papers = papers.concat(group.papers);

  return { info, papers };
}) ?? { info: undefined, papers: undefined };
</script>
