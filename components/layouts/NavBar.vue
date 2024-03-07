<template>
  <div class="nav top-0 bg-primary-0">
    <el-menu
      :class="`${route.matched[0].path === '/admin' ? '' : 'max-w-[1300px]'} mx-auto! border-none!`"
      :ellipsis="false" mode="horizontal"
      background-color="#146E3C" text-color="#FFFFFF" active-text-color="#FFFFFF"
      :router="true" :default-active="$route.path"
    >
      <el-menu-item disabled class="cursor-default! opacity-100!">
        <NuxtImg preload src="/logo.png" class="h-[30px]" />
      </el-menu-item>
      <template v-if="!isSmallScreen">
        <el-menu-item index="/">
          首页
        </el-menu-item>
        <el-menu-item index="/paper/list">
          论文列表
        </el-menu-item>
        <el-menu-item
          v-if="userStore.role === 'student'"
          index="/group"
        >
          我的小组
        </el-menu-item>
        <el-menu-item
          v-if="userStore.role === 'admin' || userStore.role === 'teacher'"
          index="/admin"
        >
          管理
        </el-menu-item>
      </template>
      <div class="flex-grow" />
      <client-only>
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
        <template #fallback>
          <el-menu-item>
            {{ userStore.username }}
          </el-menu-item>
        </template>
      </client-only>
    </el-menu>
  </div>

  <!-- Mobile Bottom Nav Bar -->
  <div v-if="isSmallScreen" class="nav bottom-0 border-t-1 border-t-border-light border-t-solid bg-white">
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
      <MobileNavButton
        v-if="userStore.role === 'student'"
        label="我的小组"
        href="/group"
      >
        <template #icon>
          <ElIconReading />
        </template>
      </MobileNavButton>
      <MobileNavButton
        v-if="userStore.role === 'admin' || userStore.role === 'teacher'" label="管理"
        href="/admin"
      >
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

const route = useRoute();

function logout() {
  userStore.logout();
  navigateTo('/');
  ElMessage({ message: '登出成功！', type: 'success', showClose: true });
}
</script>
