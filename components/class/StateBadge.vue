<template>
  <el-tag
    :type="(state.type as 'primary' | 'info' | 'success' | 'warning' | 'danger')"
    :size="size"
    :class="size === 'large' ? 'font-bold' : ''"
  >
    {{ state.label }}
  </el-tag>
</template>

<script setup lang="ts">
defineProps<{
  size: 'default' | 'large';
  state: { label: string; value: string; type: string };
}>();
</script>
