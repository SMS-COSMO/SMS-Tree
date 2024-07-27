<template>
  <el-card class="h-admin-content">
    <AdminBreadcrumb />
    <SeiueLogin router-back />
  </el-card>
</template>

<script setup lang="ts">
useHeadSafe({
  title: '登录希悦',
});
</script>
