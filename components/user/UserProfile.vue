<template>
  <el-card>
    <template #header>
      <el-icon><ElIconSetUp /></el-icon>
      用户信息
    </template>
    <client-only>
      <el-descriptions
        :column="device.isMobileOrTablet ? 2 : 4"
        size="large" class="mb-[-16px]"
      >
        <el-descriptions-item>
          <template #label>
            <div class="text-[16px]!">
              <el-icon>
                <ElIconUser />
              </el-icon>
              姓名
            </div>
          </template>
          <span class="text-[16px]!">
            {{ info?.username }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item v-if="info?.role === 'student'">
          <template #label>
            <div class="text-[16px]!">
              <el-icon>
                <ElIconLocation />
              </el-icon>
              班级
            </div>
          </template>
          <span class="text-[16px]!">
            {{ info?.className }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="text-[16px]!">
              <el-icon>
                <ElIconTickets />
              </el-icon>
              账号权限
            </div>
          </template>
          <el-tag>
            {{ roleName[info?.role ?? 'student'] }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #fallback>
        <el-skeleton :rows="1" animated />
      </template>
    </client-only>
  </el-card>
  <FoldableCard class="mt-5">
    <template #header>
      <el-icon><ElIconDocumentCopy /></el-icon>
      参与的论文
    </template>
    <div v-if="!papers?.length">
      <el-empty :image-size="130" description="暂无论文" />
    </div>
    <div v-else :class="papers?.length > 1 ? 'lg:columns-2 lg:gap-2.5' : ''">
      <template v-for="paper in papers" :key="paper.id">
        <PaperCard v-if="paper" :paper="paper" show-abstract />
      </template>
    </div>
  </FoldableCard>
</template>

<script lang="ts" setup>
import type { TPaperListSafeItem } from '~/types';

const props = defineProps<{
  userId: string;
}>();

const { $api } = useNuxtApp();

const device = useDevice();

const roleName = {
  student: '学生',
  teacher: '老师',
  admin: '管理员',
};

const { info, papers } = await useTrpcAsyncData(async () => {
  const info = await $api.user.profileSafe.query({ id: props.userId });
  let papers: (TPaperListSafeItem | undefined)[] = [];
  for (const group of (info?.groupIds ?? []))
    papers = papers.concat((await $api.group.content.query({ id: group })).papers);

  return { info, papers };
}) ?? { info: undefined, papers: undefined };
</script>
