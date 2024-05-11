<template>
  <PaperContent :id="id" class="mb-22 lg:mb-8" />
</template>

<script setup lang="ts">
useHeadSafe({
  title: '论文信息',
});

const id = useRoute().params.id.toString();
</script>
