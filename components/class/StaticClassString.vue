<template>
  <span>{{ ClassString }}</span>
</template>

<script lang="ts" setup>
import { computedAsync } from '@vueuse/core';
import type { TUserProfile } from '~/types';

const props = defineProps<{
  userInfo: TUserProfile;
}>();

const ClassString = computedAsync(
  async () => await useUserClassString(props.userInfo),
  '',
);
</script>
