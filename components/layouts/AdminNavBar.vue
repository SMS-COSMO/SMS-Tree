<template>
  <el-menu
    class="admin-nav h-full w-[220px] select-none rounded border-normal"
    :router="true"
    :default-active="$route.path"
  >
    <el-menu-item index="/admin/scoring">
      <el-icon class="i-tabler:pencil" />
      批改论文
    </el-menu-item>
    <el-menu-item index="/admin/class/list">
      <el-icon class="i-tabler:school" />
      班级列表
    </el-menu-item>
    <el-menu-item index="/admin/user/list">
      <el-icon class="i-tabler:users" />
      学生列表
    </el-menu-item>
    <el-sub-menu index="0">
      <template #title>
        <el-icon class="i-tabler:database" />
        <span>数据管理</span>
      </template>

      <el-menu-item-group>
        <template #title>
          <span>换届管理</span>
        </template>
        <el-menu-item index="/admin/class/delete">
          <el-icon class="i-tabler:trash-x" />
          删除班级
        </el-menu-item>
        <el-menu-item index="/admin/user/import">
          <el-icon class="i-tabler:users" />
          导入新生
        </el-menu-item>
        <el-menu-item index="/admin/class/import">
          <el-icon class="i-tabler:school" />
          导入班级
        </el-menu-item>
      </el-menu-item-group>

      <el-menu-item-group>
        <template #title>
          <span>创建</span>
        </template>
        <el-menu-item index="/admin/user/create">
          <el-icon class="i-tabler:user-plus" />
          创建账户
        </el-menu-item>
        <el-menu-item index="/admin/paper/create">
          <el-icon class="i-tabler:file-plus" />
          创建论文
        </el-menu-item>
        <el-menu-item index="/admin/class/create">
          <el-icon class="i-tabler:school" />
          创建班级
        </el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>

    <el-sub-menu v-if="seiueStore.loggedIn" index="1">
      <template #title>
        <NuxtImg src="/seiue.svg" class="mr-0.75 w-6" />
        已登陆希悦
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
      登陆希悦
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
const seiueStore = useSeiueStore();

const { $api } = useNuxtApp();
const enabled = computed(() => seiueStore.loggedIn);
const { data } = useQuery({
  queryKey: ['seiue.me'],
  queryFn: () => $api.seiue.me.query(),
  enabled,
});
</script>
