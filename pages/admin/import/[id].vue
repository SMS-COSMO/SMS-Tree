<template>
  <el-card class="mb-3">
    <AdminBreadcrumb :auto-detect="false" parent-path="/admin/import/history" :current-name="id" />
  </el-card>
  <ImportResult :id="id" :data="data" show-remove :show-header="false" />
</template>

<script setup lang="ts">
useHeadSafe({
  title: '导入记录',
});
const id = useRoute().params.id.toString();

const { $api } = useNuxtApp();
const { data, suspense } = useQuery({
  queryKey: [],
  queryFn: () => $api.importHistory.info.query({ id }),
});
await suspense();
</script>
