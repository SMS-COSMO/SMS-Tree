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
      <el-row :gutter="20">
        <el-col :span="device.isMobileOrTablet ? 24 : 7">
          <el-card>
            <template #header>
              <el-icon class="i-tabler:search" />
              快速搜索
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
        </el-col>
        <el-col v-if="userStore.role === 'student'" :span="device.isMobileOrTablet ? 24 : 17" class="mt-3 lg:mt-0">
          <el-card>
            <template #header>
              <el-icon class="i-tabler:presentation" />
              作业进度
            </template>
          </el-card>
        </el-col>
        <el-col v-else :span="device.isMobileOrTablet ? 24 : 17" class="mt-3 lg:mt-0">
          <el-card>
            <template #header>
              <el-icon class="i-tabler:bolt" />
              快速管理
            </template>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </el-space>
</template>

<script setup lang="ts">
useHeadSafe({
  title: '首页',
});

const device = useDevice();
const quickSearchContent = ref('');
const userStore = useUserStore();

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
