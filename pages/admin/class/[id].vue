<template>
  <template v-if="classData">
    <ClassUserList :data="classData" />
  </template>
</template>

<script lang="ts" setup>
const { $api } = useNuxtApp();
useHeadSafe({
  title: '班级信息',
});

const classData = await useTrpcAsyncData(
  () => $api.class.fullContent.query({ id: useRoute().params.id.toString() }),
);
</script>
