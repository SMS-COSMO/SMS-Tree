<template>
  <div class="mb-22">
    <el-tabs v-if="isMine" :tab-position="isSmallScreen ? 'top' : 'left'">
      <el-tab-pane label="用户信息" class="desktop:ml-4">
        <UserProfile :userId="id"></UserProfile>
      </el-tab-pane>
      <el-tab-pane label="修改密码" class="desktop:ml-4">
        <ModifyPassword></ModifyPassword>
      </el-tab-pane>
    </el-tabs>
    <UserProfile v-else :userId="id"></UserProfile>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';

const isSmallScreen = useWindowWidth();

const route = useRoute();
const id = route.params.id.toString();
const userStore = useUserStore();

const isMine = userStore.userId === id;
</script>
