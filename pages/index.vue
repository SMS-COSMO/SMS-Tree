<template>
  <el-space :size="20" direction="vertical" fill class="w-full">
    <div class="w-full">
      <el-carousel trigger="click" height="250px">
        <el-carousel-item v-for="item in 4" :key="item">
          <h3 class="justify-center" text="2xl">
            {{ item }}
          </h3>
        </el-carousel-item>
      </el-carousel>
    </div>

    <template v-if="userStore.loggedIn">
      <div class="flex flex-col gap-4 lg:flex-row">
        <div class="lg:basis-1/4">
          <el-card class="h-full">
            <template #header>
              <el-icon class="i-tabler:search" />
              搜索论文
            </template>
            <el-row :gutter="10">
              <el-col :span="19">
                <el-input v-model="quickSearchContent" clearable placeholder="输入搜索内容" @keyup.enter="quickSearch" />
              </el-col>
              <el-col :span="5">
                <el-button class="w-full" color="#15803d" plain icon="i-tabler:search" @click="quickSearch" />
              </el-col>
            </el-row>
          </el-card>
        </div>
        <div v-if="userStore.role === 'student'" class="lg:basis-3/4">
          <el-card>
            <template #header>
              <el-icon class="i-tabler:presentation" />
              作业进度
            </template>
            <StateStep :class-info="classInfo" direction="horizontal" />
          </el-card>
        </div>
        <div v-else class="lg:basis-3/4">
          <el-card>
            <template #header>
              <el-icon class="i-tabler:bolt" />
              快速管理
            </template>
          </el-card>
        </div>
      </div>
      <RandomPaper />
    </template>
  </el-space>
</template>

<script setup lang="ts">
useHeadSafe({
  title: '首页',
});

const quickSearchContent = ref('');
const userStore = useUserStore();
const { $api } = useNuxtApp();

const enabled = computed(() => userStore.classId !== undefined && userStore.classId.length > 0 && userStore.loggedIn && userStore.role === 'student');
const { data: classInfo } = useQuery({
  queryKey: ['class.info', { id: userStore.classId }],
  queryFn: () => $api.class.info.query({ id: userStore.classId }),
  enabled,
});

function quickSearch() {
  navigateTo({
    path: '/paper/list',
    query: {
      search: quickSearchContent.value,
    },
  });
}
</script>

<style scoped>
.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 250px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>
