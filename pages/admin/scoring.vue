<template>
  <el-row :gutter="16">
    <el-col :span="6">
      <el-card class="flow h-content">
        <el-scrollbar v-if="scoringQueue?.length">
          <template v-for="item in scoringQueue" :key="item">
            <TeacherPaperCard :paper="item" @selected="id => selected = id" />
          </template>
        </el-scrollbar>
        <el-empty v-else description="暂无论文" />
      </el-card>
    </el-col>
    <el-col :span="18">
      <el-card class="h-content">
        <el-scrollbar v-if="selected">
          <transition name="content" mode="out-in" class="overflow-x-hidden!">
            <TeacherPaperContent :id="selected" :key="selected" />
          </transition>
        </el-scrollbar>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';

const { $api } = useNuxtApp();

const { data: scoringQueue, suspense } = useQuery({
  queryKey: ['scoringQueue'],
  queryFn: () => $api.paper.scoringList.query(),
  refetchInterval: 60 * 1000, // 1min
});
await suspense();

const selected = ref(scoringQueue.value?.at(0)?.id);
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
