<template>
  <div class="w-full flex flex-col gap-6">
    <template v-if="userStore.loggedIn">
      <div class="w-full">
        <el-carousel trigger="click" height="250px" :interval="10000">
          <el-carousel-item v-for="item in carousel" :key="item.id">
            <el-image class="h-full w-full" :src="item.fileUrl" fit="cover" />
          </el-carousel-item>
        </el-carousel>
      </div>

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
            <div class="grid grid-cols-2 gap-2 lg:grid-cols-6">
              <el-button class="ml-0!" icon="i-tabler:home" @click="navigateTo('/admin')">
                管理中心
              </el-button>
              <el-button class="ml-0!" icon="i-tabler:pencil" @click="navigateTo('/admin/scoring')">
                批改论文
              </el-button>
              <el-button class="ml-0!" icon="i-tabler:school" @click="navigateTo('/admin/class/list')">
                班级管理
              </el-button>
              <el-button class="ml-0!" icon="i-tabler:users" @click="navigateTo('/admin/user/list')">
                学生管理
              </el-button>
              <el-button class="ml-0!" icon="i-tabler:users-plus" @click="navigateTo('/admin/import')">
                导入学生数据
              </el-button>
              <el-button class="ml-0!" icon="i-tabler:history" @click="navigateTo('/admin/import/history')">
                导入记录
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
      <QuickPaper />
    </template>
  </div>
</template>

<script setup lang="ts">
useHeadSafe({
  title: '首页',
});

const quickSearchContent = ref('');
const userStore = useUserStore();
const { $api } = useNuxtApp();

const enabled = computed(
  () =>
    userStore.classId !== undefined
    && userStore.classId.length > 0
    && userStore.loggedIn
    && userStore.role === 'student',
);

const carouselEnabled = computed(
  () => userStore.loggedIn,
);

const { data: classInfo } = useQuery({
  queryKey: ['class.info', { id: userStore.classId }],
  queryFn: () => $api.class.info.query({ id: userStore.classId }),
  enabled,
});

const { data: carousel } = useQuery({
  queryKey: ['attachment.carousel'],
  queryFn: () => $api.attachment.carousel.query(),
  enabled: carouselEnabled,
  refetchOnWindowFocus: false,
});

function quickSearch() {
  navigateTo({
    path: '/paper/list',
    query: {
      search: quickSearchContent.value,
    },
  });
}

if (!userStore.loggedIn)
  navigateTo('/user/login');
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
