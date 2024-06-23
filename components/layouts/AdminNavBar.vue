<template>
  <el-menu
    class="admin-nav h-full select-none overflow-x-auto rounded h-[69px]! md:min-w-[200px] border-normal md:h-auto!"
    :ellipsis="false"
    :mode="mode"
    :default-active="$route.path"
    :router="true"
    :show-timeout="0"
  >
    <el-menu-item index="/admin">
      <el-icon class="i-tabler:home" />
      管理中心
    </el-menu-item>
    <el-menu-item index="/admin/scoring">
      <el-icon class="i-tabler:pencil" />
      批改论文
    </el-menu-item>
    <el-menu-item index="/admin/class/list">
      <el-icon class="i-tabler:school" />
      班级管理
    </el-menu-item>
    <el-menu-item index="/admin/user/list">
      <el-icon class="i-tabler:users" />
      学生管理
    </el-menu-item>

    <el-sub-menu index="0">
      <template #title>
        <el-icon class="i-tabler:adjustments-alt" />
        <span>批量管理</span>
      </template>
      <el-menu-item index="/admin/class/delete">
        <el-icon class="i-tabler:users-minus" />
        删除班级
      </el-menu-item>
      <el-menu-item index="/admin/import">
        <el-icon class="i-tabler:users-plus" />
        导入学生数据
      </el-menu-item>
      <el-menu-item index="/admin/import/history">
        <el-icon class="i-tabler:history" />
        导入记录
      </el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="1">
      <template #title>
        <el-icon class="i-tabler:database-cog" />
        <span>数据管理</span>
      </template>
      <el-menu-item index="/admin/user/create">
        <el-icon class="i-tabler:user-plus" />
        创建账户
      </el-menu-item>
      <el-menu-item index="/admin/class/create">
        <el-icon class="i-tabler:school" />
        创建班级
      </el-menu-item>
      <el-menu-item index="/admin/paper/create">
        <el-icon class="i-tabler:file-plus" />
        创建论文
      </el-menu-item>
    </el-sub-menu>

    <el-sub-menu v-if="seiueStore.loggedIn" index="2">
      <template #title>
        <NuxtImg src="/seiue.svg" class="mr-0.75 w-6" />
        已登录希悦
      </template>
      <el-menu-item>
        <el-icon class="i-tabler:user-square-rounded" />
        {{ data?.name }}
      </el-menu-item>
      <el-menu-item @click="seiueStore.logout">
        <el-icon class="i-tabler:logout" />
        登出
      </el-menu-item>
    </el-sub-menu>
    <el-menu-item v-else index="/admin/seiue/login">
      <NuxtImg src="/seiue.svg" class="mr-0.75 w-6" />
      登录希悦
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
defineProps<{
  mode: 'vertical' | 'horizontal';
}>();

const seiueStore = useSeiueStore();
const { $api } = useNuxtApp();

const enabled = computed(() => seiueStore.loggedIn);
const { data } = useQuery({
  queryKey: ['seiue.me'],
  queryFn: () => $api.seiue.me.query(), // TODO: refresh token
  enabled,
});
</script>
