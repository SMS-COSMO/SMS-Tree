<template>
  <el-menu
    class="left-menu h-full" background-color="#f3f5f7" active-text-color="#4d4d4d" :router="true"
    :default-active="$route.path"
  >
    <el-menu-item index="/admin/register">
      <el-icon>
        <ElIconCirclePlus />
      </el-icon>
      创建账户
    </el-menu-item>
    <el-menu-item index="/admin/studentList">
      <el-icon>
        <ElIconDocument />
      </el-icon>
      学生列表
    </el-menu-item>
    <el-menu-item index="/admin/createPaper">
      <el-icon>
        <ElIconCirclePlus />
      </el-icon>
      创建论文
    </el-menu-item>
  </el-menu>
</template>

<style scoped lang="scss">
@import "~/styles/mixins.scss";

.left-menu {
  @include border-normal();
  user-select: none;
  border-radius: 10px;
  overflow: none;
  width: 250px;
}

.el-menu-item .is-active {
  background-color: #fff !important;
}
</style>
