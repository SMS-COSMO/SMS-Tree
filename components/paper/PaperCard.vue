<template>
  <CompactCard
    v-once
    class="card-button"
    @click="navigateTo(`${isAdmin ? '/admin' : ''}/paper/${paper.id}`)"
  >
    <div class="flex flex-wrap gap-1.5">
      <el-tag v-if="paper?.isPublic !== undefined && !paper.isPublic" type="danger" disable-transitions>
        <el-icon class="i-tabler:pencil" />
        待批改
      </el-tag>
      <el-tag v-if="paper?.isFeatured" type="success" disable-transitions>
        <el-icon class="i-tabler:star" />
        优秀
      </el-tag>
      <el-tag v-if="paper?.canDownload" disable-transitions>
        <el-icon class="i-tabler:download" />
        可下载
      </el-tag>
      <el-tag type="warning" disable-transitions>
        {{ getCategoryName(paper?.category) }}
      </el-tag>
      <el-tag type="info" disable-transitions>
        <el-icon class="i-tabler:calendar-time" />
        {{ paper?.createdAt?.toLocaleDateString('zh-CN') }}
      </el-tag>
    </div>
    <div class="mt-2 gap-2">
      <el-text class="break-normal font-bold text-xl!">
        {{ paper?.title }}
      </el-text>
    </div>
    <div v-if="showAuthors && 'authors' in paper" class="mt-1">
      <el-text>
        <GroupMembers :authors="paper.authors" type="text" :show-leader="false" />
      </el-text>
    </div>
    <div v-if="showAbstract && 'abstract' in paper" class="mt-2.5">
      <el-text size="small" :line-clamp="lineClamp" type="info" class="break-normal">
        {{ paper?.abstract }}
      </el-text>
    </div>
  </CompactCard>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  paper: Partial<TPaperListSafeItem>;
  showAbstract?: boolean;
  lineClamp?: number;
  showAuthors?: boolean;
  isAdmin?: boolean;
}>(), {
  showAbstract: false,
  lineClamp: 3,
  showAuthors: true,
  isAdmin: false,
});
</script>
