<template>
  <div class="absolute inset-x-0 box-border flex flex-col gap-4 px-4 lg:flex-row">
    <AdminNavBar mode="horizontal" class="lg:hidden!" />
    <AdminNavBar mode="vertical" class="hidden! lg:block!" />
    <div
      class="w-full h-admin-content"
      :class="[breakpoint.isSmallerOrEqual('md') && 'mb-16']"
    >
      <el-scrollbar>
        <div class="overflow-x-hidden">
          <slot />
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
const breakpoint = useScreen();
</script>
