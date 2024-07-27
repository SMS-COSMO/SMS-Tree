<template>
  <el-card class="h-admin-content">
    <AdminBreadcrumb />
    <el-scrollbar>
      <div class="overflow-x-hidden!">
        <TeacherPaperContent :id="id" class="relative" :is-scoring="false" />
      </div>
    </el-scrollbar>
  </el-card>
</template>

<script setup lang="ts">
useHeadSafe({
  title: '论文信息',
});
const id = useRoute().params.id.toString();
</script>

<style>
.h-admin-content>.el-card__body {
  box-sizing: border-box;
  height: 100%;
}
</style>
