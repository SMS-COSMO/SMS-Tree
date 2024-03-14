<template>
  <div class="mb-22">
    <el-tabs v-if="isMine" :tab-position="isSmallScreen ? 'top' : 'left'">
      <el-tab-pane label="用户信息" class="lg:ml-4">
        <UserProfile :user-id="id" />
      </el-tab-pane>
      <el-tab-pane label="修改密码" class="lg:ml-4">
        <ModifyPassword :user-id="id" />
      </el-tab-pane>
      <el-tab-pane label="修改用户信息" class="lg:ml-4" />
    </el-tabs>
    <UserProfile v-else :user-id="id" />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';

useHeadSafe({
  title: '用户信息',
});

const isSmallScreen = useWindowWidth();

const route = useRoute();
const id = route.params.id.toString();
const userStore = useUserStore();

const isMine = userStore.userId === id || ['admin', 'teacher'].includes(userStore.role);
</script>
