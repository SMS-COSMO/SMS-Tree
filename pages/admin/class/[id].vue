<template>
  <el-card class="mb-5 w-full">
    <template v-if="classData">
      <ClassUserList :data="classData" />
    </template>
  </el-card>
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
