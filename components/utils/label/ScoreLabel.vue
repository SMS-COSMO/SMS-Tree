<template>
  <el-tag v-if="score" :type="useScoreColor(score)">
    <el-icon class="i-tabler:chart-bar" />
    分数：{{ score }}
  </el-tag>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  score?: TPaperScore;
}>(), {
});

function useScoreColor(score: TPaperScore) {
  switch (score) {
    case 'A': return 'success';
    case 'B': return 'primary';
    case 'C': return 'warning';
    case 'D': return 'danger';
    default: return 'info';
  }
}
</script>
