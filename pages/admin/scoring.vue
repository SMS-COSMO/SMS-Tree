<template>
  <div class="flex flex-col gap-4 lg:flex-row">
    <div class="lg:basis-1/4">
      <el-card class="flow h-auto h-admin-content lg:h-admin-content!">
        <el-scrollbar v-if="scoringQueue?.list?.length">
          <div class="sticky top-0 z-10 mb-2 w-full rounded">
            <el-select-v2
              v-model="filterClass"
              :options="classFilterOptions"
              placeholder="筛选班级"
              @change="queryClient.invalidateQueries({ queryKey: ['paper.scoreList'] });"
            />
          </div>
          <div class="flex flex-row gap-2 lg:flex-col">
            <template v-for="item in scoringQueue?.list" :key="item">
              <TeacherPaperCard
                :paper="item" :current-selected="selected" class="min-w-[300px] lg:min-w-auto"
                @selected="id => selected = id"
              />
            </template>
          </div>
        </el-scrollbar>
        <el-empty v-else description="暂无论文" class="mt-10" />
      </el-card>
    </div>
    <div class="lg:basis-3/4">
      <el-card class="h-admin-content">
        <el-scrollbar v-if="selected">
          <transition name="content" mode="out-in" class="overflow-x-hidden!">
            <TeacherPaperContent
              :id="selected"
              :key="selected"
              is-scoring
            />
          </transition>
        </el-scrollbar>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
useHeadSafe({
  title: '批改论文',
});
const { $api } = useNuxtApp();
const queryClient = useQueryClient();

const filterClass = ref<string | undefined>();
const { data: scoringQueue, suspense } = useQuery({
  queryKey: ['paper.scoreList'],
  queryFn: () => $api.paper.scoringList.query(filterClass.value),
  refetchInterval: 10 * 60 * 1000, // 10min
});
await suspense();

const classFilterOptions = computed(() => {
  const initial: ({ label: string; value: string | undefined })[] = [{ label: '全部', value: undefined }];
  return initial.concat(
    scoringQueue.value?.managedClasses?.map(x => ({
      label: x.className,
      value: x.id,
    })) ?? [],
  );
});

const selectedIndex = ref(0);
const selected = computed({
  get: () => scoringQueue.value?.list?.at(selectedIndex.value)?.id,
  set: (v) => {
    if (scoringQueue.value)
      selectedIndex.value = scoringQueue.value.list.findIndex(x => x.id === v);
  },
});
</script>

<style>
.flow>.el-card__body {
  padding: 15px;
}

.content-enter-active,
.content-leave-active {
  transition: opacity 0.1s ease;
}

.content-enter-from,
.content-leave-to {
  opacity: 0;
}
</style>

<style scoped>
.floating {
  box-shadow: var(--el-box-shadow-light) !important;
}
</style>
