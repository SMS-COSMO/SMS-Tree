<!-- Main App Page -->

<template>
  <el-config-provider :locale="zhCn">
    <NuxtLoadingIndicator :height="5" color="#4AA06F" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </el-config-provider>
</template>

<script setup lang="ts">
import '~/styles/index.css';
import '~/styles/element-override.css';
import '~/styles/element-theme.css';
import '~/styles/tiptap-theme.css';

// @ts-expect-error import element-plus locale
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';

useHeadSafe({
  titleTemplate: (title?: string) => !title ? '深中知网' : `${title} | 深中知网`,
  meta: [{ name: 'description', content: '深中知网是由 COSMO 智慧校园平台运研中心开发的为深中师生服务的一站式实践研究平台。' }],
});

useSeoMeta({
  themeColor: '#15803d',
});
</script>
