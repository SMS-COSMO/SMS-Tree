<template>
  <div class="nav top-0 bg-primary-0">
    <el-menu
      class="main-nav pr-3 mx-auto! hidden! border-none! md:flex!"
      :class="[!isAdmin && 'max-w-[1300px]']"
      :ellipsis="false" mode="horizontal"
      background-color="#15803d" text-color="#FFFFFF" active-text-color="#FFFFFF"
      :router="true" :default-active="route.path"
    >
      <el-menu-item disabled class="cursor-default! opacity-100!">
        <NuxtImg preload src="/logo.svg" class="h-[25px]" @click.left="navigateTo('/')" @click.middle="blankNav('/')" />
      </el-menu-item>
      <el-menu-item v-if="userStore.loggedIn" index="/" @click.middle="blankNav('/')">
        <el-icon size="14" class="i-tabler:home" />
        首页
      </el-menu-item>
      <el-menu-item v-if="userStore.loggedIn" index="/paper/list" @click.middle="blankNav('/paper/list')">
        <el-icon size="14" class="i-tabler:list-details" />
        论文列表
      </el-menu-item>
      <el-menu-item
        v-if="userStore.loggedIn && userStore.role === 'student'"
        index="/group"
        @click.middle="blankNav('/group')"
      >
        <el-icon size="14" class="i-tabler:book" />
        我的小组
      </el-menu-item>
      <el-menu-item
        v-if="userStore.role === 'admin' || userStore.role === 'teacher'"
        index="/admin"
        @click.middle="blankNav('/admin')"
      >
        <el-icon size="14" class="i-tabler:puzzle" />
        管理
      </el-menu-item>
      <div class="flex-grow" />
      <el-sub-menu v-if="userStore.loggedIn" index="4">
        <template #title>
          <el-icon size="14" class="i-tabler:user-check" />
          {{ userStore.username }}
        </template>
        <el-menu-item :index="`/user/${userStore.userId}`">
          <el-icon size="14" class="i-tabler:id" />
          用户信息
        </el-menu-item>
        <el-menu-item @click="useLogout">
          <el-icon size="14" class="i-tabler:logout" />
          登出
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else index="/user/login">
        <el-icon size="14" class="i-tabler:login-2" />
        登录
      </el-menu-item>
    </el-menu>
  </div>

  <div class="nav bottom-0 border-t-1 border-t-border-light border-t-solid bg-white md:hidden!">
    <div class="grid grid-cols-4 px-2">
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
          <div class="i-tabler:puzzle" />
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';

const userStore = useUserStore();
const route = useRoute();

const isAdmin = ref(false);
watch(() => route.matched[0].path, (value) => {
  isAdmin.value = value === '/admin';
});
isAdmin.value = route.matched[0].path === '/admin';

function blankNav(path: string) {
  navigateTo(path, { open: { target: '_blank' } });
}
</script>

<style>
.main-nav {
  --el-menu-bg-color: #15803d !important;
  --el-menu-hover-bg-color: #136d34 !important;
}
</style>
