<template>
  <div class="top-nav">
    <el-menu
      class="menu" :ellipsis="false" mode="horizontal" background-color="#146E3C" text-color="#FFFFFF"
      active-text-color="#FFFFFF" :router="true" :default-active="$route.path"
    >
      <el-menu-item disabled class="logo">
        <NuxtImg preload src="/logo.png" class="h-[30px]" />
      </el-menu-item>
      <template v-if="!isSmallScreen">
        <el-menu-item index="/">
          首页
        </el-menu-item>
        <el-menu-item index="/paper/list">
          论文列表
        </el-menu-item>
        <el-menu-item v-if="userStore.role !== 'admin' && userStore.role !== 'teacher'" index="/group">
          小组作业
        </el-menu-item>
        <el-menu-item
          v-if="userStore.role === 'admin' || userStore.role === 'teacher'"
          index="/admin"
        >
          管理
        </el-menu-item>
      </template>
      <div class="flex-grow" />
      <el-sub-menu v-if="userStore.loggedIn" index="4">
        <template #title>
          {{ userStore.username }}
        </template>
        <el-menu-item :index="`/user/${userStore.userId}`">
          主页
        </el-menu-item>
        <el-menu-item @click="logout">
          登出
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else index="/user/login">
        登录
      </el-menu-item>
    </el-menu>
  </div>

  <!-- Mobile Bottom Nav Bar -->
  <div v-if="isSmallScreen" class="bottom-nav">
    <el-row :gutter="5" class="px-2">
      <MobileNavButton label="首页" href="/">
        <template #icon>
          <ElIconHouse />
        </template>
      </MobileNavButton>
      <MobileNavButton label="论文列表" href="/paper/list">
        <template #icon>
          <ElIconTickets />
        </template>
      </MobileNavButton>
      <MobileNavButton label="小组作业" href="/group">
        <template #icon>
          <ElIconReading />
        </template>
      </MobileNavButton>
      <MobileNavButton label="管理" href="/admin">
        <template #icon>
          <ElIconEditPen />
        </template>
      </MobileNavButton>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';

const userStore = useUserStore();

const isSmallScreen = useWindowWidth();

function logout() {
  userStore.logout();
  navigateTo('/');
  ElMessage({ message: '登出成功！', type: 'success' });
}
</script>

<style scoped lang="scss">
@import "~/styles/color.scss";

.logo {
  opacity: 1 !important;
  cursor: default !important;
}

.top-nav {
  user-select: none;
  z-index: 20;
  width: 100vw;
  position: fixed;
  top: 0;
  left: auto;
  right: auto;
  background-color: $color-primary-0;
}

.bottom-nav {
  user-select: none;
  z-index: 20;
  position: fixed;
  bottom: 0;
  width: 100vw;
  border-top: 1px solid $light-border;
  background-color: #FFFFFF;
}

.menu {
  max-width: 1300px;
  padding-right: 10px;
  border: none;
  margin-left: auto;
  margin-right: auto;
}

.flex-grow {
  flex-grow: 1;
}
</style>
