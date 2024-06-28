<template>
  <el-card>
    <template #header>
      <el-icon class="i-tabler:dice-5" />
      随机优秀论文
    </template>
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <template v-for="paper in randomPaper" :key="paper.id">
        <PaperCard :paper="paper" />
      </template>
    </div>
  </el-card>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp();
const { data: randomPaper, suspense } = useQuery({
  queryKey: ['paper.random'],
  queryFn: () => $api.paper.random.query({ count: 3 }),
});
await suspense();
</script>
