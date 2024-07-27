<template>
  <div class="grid gap-4" :class="[bookmarkedPaper?.length ? 'md:grid-cols-2' : 'grid-cols-1']">
    <el-card class="basis-1/2">
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
      <div :class="[bookmarkedPaper?.length ? 'flex flex-col gap-3' : 'grid grid-cols-1 gap-4 lg:grid-cols-3']">
        <PaperCard v-for="paper in randomPaper" :key="paper.id" :paper="paper" />
      </div>
    </el-card>
    <el-card v-if="bookmarkedPaper?.length" class="basis-1/2">
      <template #header>
        <div class="flex gap-1">
          <el-icon class="i-tabler:bookmark self-center" />
          <span class="self-center">
            收藏的论文
          </span>
        </div>
      </template>
      <div class="flex flex-col gap-3">
        <PaperCard v-for="paper in bookmarkedPaper" :key="paper.id" bookmarked :paper="paper" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp();
const queryClient = useQueryClient();
const { data: randomPaper, suspense: randomSuspense } = useQuery({
  queryKey: ['paper.random'],
  queryFn: () => $api.paper.random.query({ count: 3 }),
  refetchOnWindowFocus: false,
});
await randomSuspense();

const { data: bookmarkedPaper, suspense: bookmarksSuspense } = useQuery({
  queryKey: ['paper.bookmarksWithInfo'],
  queryFn: () => $api.paper.bookmarksWithInfo.query(),
  refetchOnWindowFocus: false,
});
await bookmarksSuspense();
</script>
