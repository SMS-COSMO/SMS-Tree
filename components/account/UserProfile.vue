<template>
  <el-card>
    <template #header>
      用户信息
    </template>
    <el-skeleton :rows="5" :loading="contentLoading" animated>
      <el-descriptions :column="isSmallScreen ? 2 : 4" size="large" style="margin-bottom: -20px;">
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon>
                <ElIconUser />
              </el-icon>
              姓名
            </div>
          </template>
          <span class="cell-item">
            {{ info?.username }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon>
                <ElIconUser />
              </el-icon>
              学号
            </div>
          </template>
          <span class="cell-item">
            {{ info?.id }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item v-if="info?.role === 'student'">
          <template #label>
            <div class="cell-item">
              <el-icon>
                <ElIconLocation />
              </el-icon>
              班级
            </div>
          </template>
          <span class="cell-item">
            {{ classString }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
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
    </el-skeleton>
  </el-card>
  <FoldableCard class="mt-5">
    <template #header>
      参与的论文
    </template>
    <el-skeleton :rows="10" :loading="paperLoading" animated>
      <div class="desktop:columns-2">
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
import type { TPaperListWithAuthorOutput, TUserProfileOutput, TClassContentOutput } from '~/types/index';

const props = defineProps<{
  userId: string
}>();

const { $api } = useNuxtApp();

const isSmallScreen = useWindowWidth();

const roleName = {
  student: '学生',
  teacher: '老师',
  admin: '管理员',
};

const info = ref<TUserProfileOutput>();
const papers = ref<TPaperListWithAuthorOutput>([]);
const classInfo = ref<TClassContentOutput>();
const classString = computed(() => {
  if (!classInfo.value)
    return '';
  const now = new Date();
  const yearString = ['', '高一', '高二', '毕业'];
  const year = now.getFullYear() - classInfo.value.enterYear + (now.getMonth() > 8 ? 1 : 0);

  return `${yearString[year]}（${classInfo.value.index}）`;
});
const contentLoading = ref(true);
const paperLoading = ref(true);

onMounted(async () => {
  try {
    info.value = await $api.user.profile.query({ id: props.userId });
    contentLoading.value = false;

    let paperIds: string[] = [];
    for (const group of info.value.groupIds)
      paperIds = paperIds.concat((await $api.group.content.query({ id: group })).papers);
    for (const paper of paperIds)
      papers.value.push(await $api.paper.contentWithAuthor.query({ id: paper }));
    paperLoading.value = false;

    classInfo.value = await $api.class.content.query({ id: info.value.classIds[0]});
    
  } catch (err) {
    useErrorHandler(err);
  }
});
</script>

<style scoped lang="scss">
.cell-item {
  font-size: 16px !important;
}
</style>
