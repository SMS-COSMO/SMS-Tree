<template>
  <div class="nav top-0 bg-primary-0">
    <el-menu
      v-if="!device.isMobileOrTablet"
      :class="`${isAdmin ? '' : 'max-w-[1300px]'} mx-auto! border-none! pr-3 main-nav`"
      :ellipsis="false" mode="horizontal"
      background-color="#15803d" text-color="#FFFFFF" active-text-color="#FFFFFF"
      :router="true" :default-active="$route.path"
    >
      <el-menu-item disabled class="cursor-default! opacity-100!">
        <NuxtImg preload src="/logo.png" class="h-[30px]" />
      </el-menu-item>
      <template v-if="!device.isMobileOrTablet">
        <el-menu-item index="/">
          首页
        </el-menu-item>
        <el-menu-item index="/paper/list">
          论文列表
        </el-menu-item>
        <el-menu-item
          v-if="userStore.loggedIn && userStore.role === 'student'"
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
      <el-sub-menu v-if="userStore.loggedIn" index="4">
        <template #title>
          {{ userStore.username }}
        </template>
        <el-menu-item :index="`/user/${userStore.userId}`">
          主页
        </el-menu-item>
        <el-menu-item @click="useLogout">
          登出
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else index="/user/login">
        登录
      </el-menu-item>
    </el-menu>
  </div>

  <div v-if="device.isMobileOrTablet" class="nav bottom-0 border-t-1 border-t-border-light border-t-solid bg-white">
    <el-row class="px-2">
      <MobileNavButton label="首页" href="/">
        <template #icon>
          <div class="i-tabler:home" />
        </template>
      </MobileNavButton>
      <MobileNavButton label="论文列表" href="/paper/list">
        <template #icon>
          <div class="i-tabler:list-details" />
        </template>
      </MobileNavButton>
      <MobileNavButton
        v-if="userStore.loggedIn && userStore.role === 'student'"
        label="我的小组"
        href="/group"
      >
        <template #icon>
          <div class="i-tabler:book" />
        </template>
      </MobileNavButton>
      <MobileNavButton
        v-if="userStore.role === 'admin' || userStore.role === 'teacher'"
        label="管理"
        href="/admin"
      >
        <template #icon>
          <div class="i-tabler:pencil" />
        </template>
      </MobileNavButton>
      <MobileNavButton
        v-if="userStore.loggedIn"
        :href="`/user/${userStore.userId}`"
        label="我的"
      >
        <template #icon>
          <div class="i-tabler:user" />
        </template>
      </MobileNavButton>
      <MobileNavButton
        v-if="!userStore.loggedIn"
        href="/user/login"
        label="登录"
      >
        <template #icon>
          <div class="i-tabler:login" />
        </template>
      </MobileNavButton>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';

const userStore = useUserStore();
const route = useRoute();
const device = useDevice();

const isAdmin = ref(false);
watch(() => route.matched[0].path, (value) => {
  isAdmin.value = value === '/admin';
});
isAdmin.value = route.matched[0].path === '/admin';
</script>
