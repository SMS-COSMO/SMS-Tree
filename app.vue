<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp();

onBeforeMount(async () => {
  try {
    await $api.user.tokenValidity.query();
  } catch (err) {
    navigateTo('/user/login');
  }
});
</script>

<style lang="scss">
@use "~/styles/element-override.scss";
@use "~/styles/index.scss";
@use "~/styles/color.scss";
</style>