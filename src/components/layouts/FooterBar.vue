<template>
  <footer class="footer">
    <span>Icon copyright ...</span>
    <el-link type="primary" href="https://github.com/SMS-COSMO/SMS-Tree" class="link">代码仓库</el-link>
    <el-link type="primary" class="link">反馈</el-link>
    <el-link type="primary" class="link">加入 COSMO</el-link>
    <el-link type="primary" class="link">API</el-link>
    <el-link type="primary" class="link">......</el-link>
    <el-link type="primary" class="link">......</el-link>
  </footer>
</template>

<style lang="scss">
@import "../../styles/color.scss";

.footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  width: 100%;

  margin-right: auto;
  margin-left: auto;

  margin-top: 40px;
  padding-top: 20px;
  padding-bottom: 10px;

  border-top: 2px solid $light_border;
}

.link {
  font-size: 14px;
  font-weight: 500;
}
</style>