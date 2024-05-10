<template>
  <ReportForm :category="category" type="create" />
</template>

<script setup lang="ts">
defineProps<{
  category: TReportCategory;
}>();
</script>
