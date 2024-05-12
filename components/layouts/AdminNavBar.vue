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
      <el-icon class="i-tabler:list" />
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
          删除过期班级
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
  </el-menu>
</template>
