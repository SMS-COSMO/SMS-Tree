<template>
  <el-menu
    class="h-full w-[250px] select-none rounded border-normal"
    background-color="#f3f5f7"
    active-text-color="#4d4d4d"
    :router="true"
    :default-active="$route.path"
  >
    <el-sub-menu index="1">
      <template #title>
        <el-icon>
          <ElIconCirclePlus />
        </el-icon>
        <span>创建</span>
      </template>
      <el-menu-item index="/admin/user/create">
        <el-icon>
          <ElIconCirclePlus />
        </el-icon>
        创建账户
      </el-menu-item>
      <el-menu-item index="/admin/paper/create">
        <el-icon>
          <ElIconCirclePlus />
        </el-icon>
        创建论文
      </el-menu-item>
      <el-menu-item index="/admin/class/create">
        <el-icon>
          <ElIconCirclePlus />
        </el-icon>
        创建班级
      </el-menu-item>
    </el-sub-menu>

    <el-menu-item index="/admin/user/list">
      <el-icon>
        <ElIconDocument />
      </el-icon>
      学生列表
    </el-menu-item>
    <el-menu-item index="/admin/class/list">
      <el-icon>
        <ElIconDocument />
      </el-icon>
      班级列表
    </el-menu-item>
  </el-menu>
</template>
