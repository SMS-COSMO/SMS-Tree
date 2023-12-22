<template>
  <footer class="footer mx-auto mt-10 w-full">
    <span>Icon copyright ...</span>
    <el-link type="primary" class="link" @click="$router.push('/feedback')">
      反馈
    </el-link>
    <el-link type="primary" href="https://github.com/SMS-COSMO/SMS-Tree" class="link">
      代码仓库
    </el-link>
    <el-link href="https://joincosmo.link/" type="primary" class="link">
      加入 COSMO
    </el-link>
    <el-link type="primary" class="link">
      API
    </el-link>
    <el-link type="primary" class="link">
      ......
    </el-link>
    <el-link type="primary" class="link">
      ......
    </el-link>
  </footer>
</template>

<style lang="scss">
@import "~/styles/color.scss";

.footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  padding-top: 20px;
  padding-bottom: 10px;

  border-top: 2px solid $light-border;
}

.link {
  font-size: 14px;
  font-weight: 500;
}
</style>
