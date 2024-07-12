<template>
  <el-card>
    <template #header>
      <div class="flex gap-1">
        <el-icon class="i-tabler:dice-5 self-center" />
        <span class="self-center">
          随机优秀论文
        </span>
        <el-icon
          class="i-tabler:refresh ml-auto cursor-pointer self-center"
          @click="queryClient.invalidateQueries({ queryKey: ['paper.random'] })"
        />
      </div>
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
const queryClient = useQueryClient();
const { data: randomPaper, suspense } = useQuery({
  queryKey: ['paper.random'],
  queryFn: () => $api.paper.random.query({ count: 3 }),
  refetchOnWindowFocus: false,
});
await suspense();
</script>
