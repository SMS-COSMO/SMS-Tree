<template>
  <div class="flex-grow" @click="navigateTo(href)">
    <div
      class="mx-1 my-2 h-10 p-1.5 text-center leading-[0.95] rounded"
      :class="isHighlight ? 'transition-all bg-hover-bg' : ''"
    >
      <el-icon :size="16" color="#606266">
        <slot name="icon" />
      </el-icon>
      <br>
      <el-text size="small">
        {{ label }}
      </el-text>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string;
  href: string;
}>();

const route = useRoute();
const isHighlight = computed(() => route.fullPath === props.href);
</script>
