<template>
  <span>{{ ClassString }}</span>
</template>

<script lang="ts" setup>
import { computedAsync } from '@vueuse/core';
import type { TUserProfileOutput } from '~/types';

const props = defineProps<{
  userInfo: TUserProfileOutput;
}>();

const ClassString = computedAsync(
  async () => await useUserClassString(props.userInfo),
  '',
);
</script>
