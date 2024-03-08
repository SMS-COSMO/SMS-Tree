<template>
  <el-card>
    <template #header>
      用户信息
    </template>
    <el-descriptions :column="isSmallScreen ? 2 : 4" size="large" style="margin-bottom: -20px;">
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
      <el-descriptions-item>
        <template #label>
          <div class="text-[16px]!">
            <el-icon>
              <ElIconUser />
            </el-icon>
            学号
          </div>
        </template>
        <span class="text-[16px]!">
          {{ info?.id }}
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
        <el-tag size="small">
          {{ roleName[info?.role ?? 'student'] }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
  <FoldableCard class="mt-5">
    <template #header>
      参与的论文
    </template>
    <el-skeleton :rows="10" :loading="paperLoading" animated>
      <div :class="papers.length > 1 ? 'lg:columns-2' : ''">
        <div v-for="(paper, index) in papers" :key="index">
          <PaperCard :paper="paper" show-abstract />
        </div>
      </div>
      <div v-if="!papers.length">
        <el-empty :image-size="130" description="暂无论文" />
      </div>
    </el-skeleton>
  </FoldableCard>
</template>

<script lang="ts" setup>
import type { TPaperListWithAuthor } from '~/types/index';

const props = defineProps<{
  userId: string;
}>();

const { $api } = useNuxtApp();

const isSmallScreen = useWindowWidth();

const roleName = {
  student: '学生',
  teacher: '老师',
  admin: '管理员',
};

const info = await useTrpcAsyncData(() => $api.user.profile.query({ id: props.userId }));
const papers = ref<TPaperListWithAuthor>([]);
const paperLoading = ref(true);

onMounted(async () => {
  try {
    let paperIds: string[] = [];
    for (const group of (info?.groupIds ?? []))
      paperIds = paperIds.concat((await $api.group.content.query({ id: group })).papers);
    for (const paper of paperIds)
      papers.value.push(await $api.paper.contentWithAuthor.query({ id: paper }));
    paperLoading.value = false;
  } catch (err) {
    useErrorHandler(err);
  }
});
</script>
