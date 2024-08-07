<template>
  <div class="flex flex-col gap-4 lg:flex-row">
    <div class="lg:basis-1/4">
      <el-card class="flow h-auto h-admin-content lg:h-admin-content!">
        <el-scrollbar>
          <div class="sticky top-0 z-10 mb-2 w-full flex gap-2 rounded">
            <el-checkbox v-model="showMine" size="large" label="仅展示我的" border />
            <el-select-v2
              v-model="filterClass"
              :options="classFilterOptions"
              placeholder="筛选班级"
              @change="selectedIndex = 0"
            />
          </div>
          <div v-if="filteredScoringQueue?.length" class="flex flex-row gap-2 lg:flex-col">
            <template v-for="item in filteredScoringQueue" :key="item">
              <TeacherPaperCard
                :paper="item" :current-selected="selected" class="min-w-[300px] lg:min-w-auto"
                @selected="id => selected = id"
              />
            </template>
          </div>
          <el-empty v-else description="暂无论文" />
        </el-scrollbar>
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
        <el-empty v-else description="请先选中待批改的论文" />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
useHeadSafe({
  title: '批改论文',
});
const { $api } = useNuxtApp();
const userStore = useUserStore();

const showMine = ref(userStore.role !== 'admin');

const filterClass = ref<string | undefined>();
const { data: scoringQueue, suspense } = useQuery({
  queryKey: ['paper.scoreList'],
  queryFn: () => $api.paper.scoringList.query(),
  refetchInterval: 10 * 60 * 1000, // 10min
});
await suspense();

const { data: classList, suspense: classListSuspense } = useQuery({
  queryKey: ['class.list'],
  queryFn: () => $api.class.list.query(),
});
await classListSuspense();

const { data: teacherClasses, suspense: teacherClassesSuspense } = useQuery({
  queryKey: ['user.teacherClasses', { id: userStore.userId }],
  queryFn: () => $api.user.teacherClasses.query(userStore.userId),
});
await teacherClassesSuspense();

const filteredScoringQueue = computed(() =>
  scoringQueue.value?.filter((x) => {
    if (filterClass.value)
      return x.class.id === filterClass.value;
    return (showMine.value ? teacherClasses.value : classList.value)?.some(c => c.id === x.class.id);
  }),
);

const classFilterOptions = computed(() => {
  const initial: ({ label: string; value: string | undefined })[] = [{ label: '全部', value: undefined }];
  return initial.concat(
    (showMine.value ? teacherClasses.value : classList.value)?.map(x => ({
      label: x.className,
      value: x.id,
    })) ?? [],
  );
});

watch(showMine, () => {
  filterClass.value = undefined;
});

const selectedIndex = ref(0);
const selected = computed({
  get: () => filteredScoringQueue.value?.at(selectedIndex.value)?.id,
  set: (v) => {
    if (filteredScoringQueue.value)
      selectedIndex.value = filteredScoringQueue.value.findIndex(x => x.id === v);
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
