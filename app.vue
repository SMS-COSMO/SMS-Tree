<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import '~/styles/index.css';
import '~/styles/element-override.css';

const { $api } = useNuxtApp();

useHeadSafe({
  titleTemplate: (title?: string) => !title ? '深中知网' : `${title} | 深中知网`,
  meta: [{ name: 'description', content: '深中知网是由 COSMO 智慧校园平台运研中心开发的为深中师生服务的一站式实践研究平台。' }],
});

onBeforeMount(async () => {
  try {
    await $api.user.tokenValidity.query();
  } catch (err) {
    navigateTo('/user/login');
  }
});
</script>
