<template>
  <div class="absolute inset-x-0 box-border flex flex-col gap-4 px-4 lg:flex-row">
    <client-only v-if="device.isMobileOrTablet">
      <el-popover :width="0" trigger="click">
        <template #reference>
          <el-button :icon="ElIconExpand" type="info" plain class="w-20">
            菜单
          </el-button>
        </template>
        <AdminNavBar />
      </el-popover>
    </client-only>
    <AdminNavBar v-else />
    <slot />
  </div>
</template>

<script setup lang="ts">
const device = useDevice();
</script>
