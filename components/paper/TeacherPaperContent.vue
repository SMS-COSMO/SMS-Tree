<template>
  <div class="space-y-3 lg:space-y-4">
    <h1 class="w-full text-2xl lg:pr-[2em] lg:text-4xl">
      {{ info?.title }}
    </h1>

    <el-row :gutter="20">
      <el-col :span="7">
        <FoldableCard :can-fold="device.isMobileOrTablet" class="box-border h-full">
          <template #header>
            <el-icon><ElIconInfoFilled /></el-icon>
            论文信息
          </template>
          <el-descriptions :column="1">
            <el-descriptions-item label="班级">
              <el-link :href="`/admin/class/${classInfo?.id}`">
                {{ classInfo?.className }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item v-if="info?.authors" label="作者">
              <GroupMembers :authors="info?.authors" :leader="info?.leader" type="link" class="inline" />
            </el-descriptions-item>
            <el-descriptions-item label="提交时间">
              {{ info?.createdAt.toLocaleDateString('zh-CN') }}
            </el-descriptions-item>
            <el-descriptions-item label="分类">
              <el-tag effect="plain" type="warning">
                {{ getCategoryName(info?.category) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="info?.keywords.length" label="关键词">
              <span class="space-x-1">
                <el-tag
                  v-for="(keyword, index) in info?.keywords" :key="index" class="my-1 cursor-pointer" type="info"
                  effect="plain" @click="searchTag(keyword)"
                >
                  {{ keyword }}
                </el-tag>
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </FoldableCard>
      </el-col>
      <el-col :span="17" class="mt-3 lg:mt-0">
        <FoldableCard :can-fold="device.isMobileOrTablet" class="box-border h-full">
          <template #header>
            <el-icon><ElIconList /></el-icon>
            摘要
          </template>
          <div class="text-justify text-[15px] leading-normal lg:text-base">
            {{ info?.abstract }}
          </div>
        </FoldableCard>
      </el-col>
    </el-row>

    <template v-if="attachments?.length && (attachments?.findIndex(e => e.S3FileId) !== -1)">
      <Preview :attachment="attachments?.filter(a => a.category === 'paperDocument')[0]" full-height />
    </template>
  </div>
</template>

<script setup lang="ts">
import { getCategoryName } from '~/constants/paper';

const props = defineProps<{
  id: string;
}>();

const { $api } = useNuxtApp();

const device = useDevice();

const [info, attachments] = await useTrpcAsyncData(() => Promise.all([
  $api.paper.info.query({ id: props.id }),
  $api.paper.attachments.query({ id: props.id }),
])) ?? [];

// TODO perf: don't use groupInfo and classInfo which gets members multiple times
const groupInfo = await useTrpcAsyncData(() => $api.group.content.query({ id: info?.groupId ?? '' }));
const classInfo = await useTrpcAsyncData(() => $api.class.fullContent.query({ id: groupInfo?.classId ?? '' }));

function searchTag(keyword: string) {
  navigateTo({
    path: '/paper/list',
    query: {
      search: keyword,
    },
  });
}
</script>
