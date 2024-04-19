<template>
  <el-menu
    class="h-full w-[220px] select-none rounded border-normal"
    background-color="#f3f5f7"
    active-text-color="#4d4d4d"
    :router="true"
    :default-active="$route.path"
  >
    <el-menu-item index="/admin/scoring">
      <el-icon class="i-tabler:pencil" />
      批改论文
    </el-menu-item>
    <el-menu-item index="/admin/class/list">
      <el-icon class="i-tabler:list" />
      班级列表
    </el-menu-item>
    <el-menu-item index="/admin/user/list">
      <el-icon class="i-tabler:users" />
      学生列表
    </el-menu-item>
    <el-sub-menu index="1">
      <template #title>
        <el-icon class="i-tabler:circle-plus" />
        <span>创建</span>
      </template>
      <el-menu-item index="/admin/user/create">
        <el-icon class="i-tabler:user" />
        创建账户
      </el-menu-item>
      <el-menu-item index="/admin/paper/create">
        <el-icon class="i-tabler:file-plus" />
        创建论文
      </el-menu-item>
      <el-menu-item index="/admin/class/create">
        <el-icon class="i-tabler:building" />
        创建班级
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>
