<template>
  <div class="absolute inset-x-0 box-border flex flex-col gap-4 px-4 md:flex-row">
    <AdminNavBar mode="horizontal" class="md:hidden!" />
    <div class="hidden! h-admin-content md:block!">
      <el-scrollbar>
        <AdminNavBar mode="vertical" />
      </el-scrollbar>
    </div>
    <div
      class="w-full h-admin-content"
      :class="[breakpoint.isSmaller('md') && 'mb-16']"
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
