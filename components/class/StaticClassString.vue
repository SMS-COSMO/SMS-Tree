<template>
  <span>{{ ClassString }}</span>
</template>

<script lang="ts" setup>
import { computedAsync } from '@vueuse/core';

const props = defineProps(['classId']);

const ClassString = computedAsync(
  async () => await useUserClassString(props.classId),
  '',
);
</script>
