<template>
  <div>
    <NavBar />
    <div :class="`${device.isMobileOrTablet ? 'mt-5' : 'mt-20'} mx-auto max-w-[1300px] px-4 lg:px-5`">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const device = useDevice();
</script>
