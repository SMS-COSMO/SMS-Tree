<template>
  <el-card
    :class="`mb-2 cursor-pointer hover:border-color-[#D4D7DE]! hover:bg-hover-bg! ${currentSelected === paper.id ? 'bg-hover-bg!' : ''}`"
    @click="$emit('selected', paper.id)"
  >
    <el-row class="gap-[6px]">
      <el-tag type="warning" disable-transitions>
        {{ getCategoryName(paper?.category) }}
      </el-tag>
      <el-tag type="primary" disable-transitions>
        {{ paper.className }}
      </el-tag>
      <el-tag type="info" disable-transitions>
        {{ paper?.createdAt?.toLocaleDateString('zh-CN') }}
      </el-tag>
    </el-row>
    <el-row class="mt-1 gap-1">
      <el-text class="break-normal font-bold text-lg!">
        {{ paper?.title }}
      </el-text>
      <el-text v-if="showAuthors && 'authors' in paper" size="small">
        <GroupMembers :authors="paper.authors" type="text" :show-leader="false" />
      </el-text>
    </el-row>
  </el-card>
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
