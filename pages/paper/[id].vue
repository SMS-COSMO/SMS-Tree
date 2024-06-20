<template>
  <PaperContent :id="id" />
</template>

<script setup lang="ts">
useHeadSafe({
  title: '论文信息',
});

const id = useRoute().params.id.toString();
</script>
