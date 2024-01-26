<template>
  <el-backtop :right="isSmallScreen ? 30 : 100" :bottom="100" />

  <div class="title-holder mb-3">
    <h1 class="title">
      <el-skeleton animated :rows="0" :loading="contentLoading">
        <el-tag v-if="content?.isFeatured" type="success" size="large">
          <el-text style="color: var(--el-color-success);">
            <el-icon>
              <ElIconStar />
            </el-icon>
            优秀作业
          </el-text>
        </el-tag>
        {{ content?.title }}
      </el-skeleton>
    </h1>
    <el-skeleton v-if="!isSmallScreen" animated :loading="contentLoading" :rows="2" style="width: 200px">
      <el-space :size="20">
        <el-statistic :value="content?.rate">
          <template #title>
            分数
          </template>
        </el-statistic>
        <el-divider direction="vertical" style="height: 40px;" />
        <el-statistic :value="content?.downloadCount">
          <template #title>
            下载次数
          </template>
        </el-statistic>
      </el-space>
    </el-skeleton>
  </div>

  <el-row :gutter="20">
    <el-col :span="isSmallScreen ? 24 : 6">
      <FoldableCard :can-fold="isSmallScreen">
        <template #header>
          论文信息
        </template>
        <el-skeleton animated :rows="4" :loading="contentLoading">
          <el-descriptions title="" :column="1">
            <el-descriptions-item label="作者">
              <GroupMembers :authors="content?.authors" :leader-id="content?.leader.id" type="link" class="inline" />
            </el-descriptions-item>
            <el-descriptions-item label="发布时间">
              {{ content?.createdAt.toLocaleDateString('zh-CN') }}
            </el-descriptions-item>
            <el-descriptions-item label="关键词">
              <el-tag
                v-for="(keyword, index) in content?.keywords" :key="index" class="clickable m-0.75" type="info"
                effect="plain" @click="searchTag(keyword)"
              >
                {{ keyword }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="isSmallScreen" label="分数">
              {{ content?.rate }}
            </el-descriptions-item>
            <el-descriptions-item v-if="isSmallScreen" label="下载次数">
              {{ content?.downloadCount }}
            </el-descriptions-item>
          </el-descriptions>
        </el-skeleton>
        <Attachment :paper="content" />
      </FoldableCard>
    </el-col>
    <el-col :span="isSmallScreen ? 24 : 18" :class="isSmallScreen ? 'mt-4' : ''">
      <FoldableCard :can-fold="isSmallScreen">
        <template #header>
          摘要
        </template>
        <el-skeleton animated :rows="4" :loading="contentLoading">
          <div class="abstract leading-normal">
            {{ content?.abstract }}
          </div>
        </el-skeleton>
      </FoldableCard>
    </el-col>
  </el-row>

  <el-card class="mt-5">
    <WordView url="https://ztl-uwu.github.io/test.docx" />
  </el-card>

  <el-card class="mt-5">
    <WordView type="pdf" url="https://ztl-uwu.github.io/test.pdf" />
  </el-card>

  <el-card class="desktop:mb-5 mb-22 mt-5">
    <template #header>
      教师评语
    </template>
  </el-card>
</template>

<script setup lang="ts">
import Attachment from '~/components/paper/Attachment.vue';
import type { TPaperContentWithAuthor } from '~/types/index';

useHeadSafe({
  title: '论文信息',
});

const { $api } = useNuxtApp();
const route = useRoute();

const id = route.params.id.toString();
const isSmallScreen = useWindowWidth();

const contentLoading = ref(true);
const content = ref<TPaperContentWithAuthor>();

function searchTag(keyword: string) {
  navigateTo({
    path: '/paper/list',
    query: {
      search: keyword,
    },
  });
}

onMounted(async () => {
  try {
    content.value = await $api.paper.contentWithAuthor.query({ id });
    contentLoading.value = false;
  } catch (err) {
    useErrorHandler(err);
  }
});
</script>

<style scoped lang="scss">
.title {
  width: 100%;

  @media only screen and (min-width: 700px) {
    padding-right: 4em;
    font-size: 45px;
  }

  font-size: 30px;
}

.title-holder {
  @media only screen and (min-width: 700px) {
    display: flex;
  }
}

.abstract {
  text-align: justify;
  font-size: 16px;
  padding: 5px;

  @media only screen and (max-width: 700px) {
    font-size: 15px;
    padding: 0;
  }
}

.download-dialog {
  width: 30%;
}

.clickable {
  cursor: pointer;
}
</style>

<style lang="scss">
.el-descriptions__label {
  font-weight: bold;
}
</style>
