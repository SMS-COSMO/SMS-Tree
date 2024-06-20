<template>
  <div :class="`${device.isMobileOrTablet ? '-mt-3' : ''}`">
    <AdminNavBar />
  </div>
  <div :class="`${device.isMobileOrTablet ? 'mt-2' : 'mt-4'} w-full h-content`">
    <slot />
  </div>
</template>

<script setup lang="ts">
const device = useDevice();
</script>
