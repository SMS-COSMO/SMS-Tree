<template>
  <CompactCard
    v-once
    class="mb-2 cursor-pointer lg:mb-2.5 hover:border-color-[#D4D7DE]! hover:bg-hover-bg!"
    @click="navigateTo(`${isAdmin ? '/admin' : ''}/paper/${paper.id}`)"
  >
    <el-row class="gap-[6px]">
      <el-tag v-if="paper?.isPublic !== undefined && !paper.isPublic" type="danger" disable-transitions>
        <el-icon class="i-tabler:pencil" />
        待批改
      </el-tag>
      <IsFeaturedLabel :is-featured="paper?.isFeatured" />
      <CanDownloadLabel :can-download="paper?.canDownload" />
      <CategoryLabel :category-id="paper?.category" :interactive="false" />
      <ScoreLabel :score="paper?.score" />
      <DateLabel :date="paper?.createdAt" />
    </el-row>
    <el-row class="mt-2 gap-2">
      <el-text class="break-normal font-bold text-xl!">
        {{ paper?.title }}
      </el-text>
    </el-row>
    <el-row v-if="showAuthors && 'authors' in paper" class="mt-1">
      <el-text>
        <GroupMembers :authors="paper.authors" type="text" :show-leader="false" />
      </el-text>
    </el-row>
    <el-row v-if="showAbstract && 'abstract' in paper" class="mt-2.5">
      <el-text size="small" :line-clamp="lineClamp" type="info" class="break-normal">
        {{ paper?.abstract }}
      </el-text>
    </el-row>
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
