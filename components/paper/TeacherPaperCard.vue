<template>
  <CompactCard
    :class="`card-button ${currentSelected === paper.id ? 'bg-hover-bg!' : ''}`"
    @click="$emit('selected', paper.id)"
  >
    <el-row class="gap-[6px]">
      <el-tag type="warning" disable-transitions>
        {{ getCategoryName(paper?.category) }}
      </el-tag>
      <el-tag type="primary" disable-transitions>
        {{ paper.class?.className }}
      </el-tag>
      <el-tag type="info" disable-transitions>
        {{ paper?.createdAt?.toLocaleDateString('zh-CN') }}
      </el-tag>
    </el-row>
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
  paper: Partial<TPaperScoringItem>;
  showAbstract?: boolean;
  lineClamp?: number;
  showAuthors?: boolean;
  currentSelected?: string;
}>(), {
  showAbstract: false,
  lineClamp: 3,
  showAuthors: true,
});

defineEmits(['selected']);
</script>
