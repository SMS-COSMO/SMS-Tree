<template>
  <el-tooltip
    :content="bookmarked ? '取消收藏' : '收藏'"
    placement="top"
  >
    <div class="ml-auto cursor-pointer" @click="mutate({ id: paperId })">
      <el-icon v-if="bookmarked" class="i-tabler:bookmark-filled" />
      <el-icon v-else class="i-tabler:bookmark" />
    </div>
  </el-tooltip>
</template>

<script setup lang="ts">
const props = defineProps<{
  paperId: string;
  bookmarked: boolean | undefined;
}>();

const { $api } = useNuxtApp();
const queryClient = useQueryClient();
const { mutate } = useMutation({
  mutationFn: $api.paper.toggleBookmark.mutate,
  onSuccess: () => {
    useMessage({
      message: props.bookmarked ? '取消收藏成功' : '收藏成功',
      type: 'success',
    });
    queryClient.invalidateQueries({
      queryKey: ['paper.info', { id: props.paperId }],
    });
    queryClient.invalidateQueries({
      queryKey: ['paper.infoWithClass', { id: props.paperId }],
    });
    queryClient.invalidateQueries({ queryKey: ['paper.bookmarks'] });
    queryClient.invalidateQueries({ queryKey: ['paper.bookmarksWithInfo'] });
  },
});
</script>
