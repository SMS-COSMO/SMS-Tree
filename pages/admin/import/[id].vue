<template>
  <ImportResult :id="id" :data="data" show-remove :show-header="false" />
</template>

<script setup lang="ts">
useHeadSafe({
  title: '导入记录',
});
const id = useRoute().params.id.toString();

const { $api } = useNuxtApp();
const { data, suspense } = useQuery({
  queryKey: ['importHistory.info', { id }],
  queryFn: () => $api.importHistory.info.query({ id }),
});
await suspense();
</script>
