<template>
  <TeacherPaperContent
    v-if="['teacher', 'admin'].includes(userStore.role)"
    :id="id"
    :is-scoring="false"
    class="pt-2"
  />
  <PaperContent v-else :id="id" />
</template>

<script setup lang="ts">
useHeadSafe({
  title: '论文信息',
});

const id = useRoute().params.id.toString();
const userStore = useUserStore();
</script>
