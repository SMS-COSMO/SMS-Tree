<template>
  <el-row :gutter="16">
    <el-col :span="6">
      <el-card class="flow h-content">
        <div class="floating absolute z-10 w-40 rounded">
          <el-select-v2
            v-model="filterClass"
            :options="classFilterOptions"
            placeholder="筛选班级"
            @change="queryClient.invalidateQueries({ queryKey: ['scoringQueue'] });"
          />
        </div>
        <el-scrollbar v-if="scoringQueue?.list?.length">
          <div class="h-12" />
          <template v-for="item in scoringQueue?.list" :key="item">
            <TeacherPaperCard
              :paper="item" :current-selected="selected" @selected="id => selected = id"
            />
          </template>
        </el-scrollbar>
        <el-empty v-else description="暂无论文" class="mt-10" />
      </el-card>
    </el-col>
    <el-col :span="18">
      <el-card class="h-content">
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
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
useHeadSafe({
  title: '批改论文',
});
const { $api } = useNuxtApp();
const queryClient = useQueryClient();

const filterClass = ref<string | undefined>();
const { data: scoringQueue, suspense } = useQuery({
  queryKey: ['scoringQueue'],
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

.h-content>.el-card__body {
  box-sizing: border-box;
  height: 100%;
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
