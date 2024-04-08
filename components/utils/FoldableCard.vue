<template>
  <el-card v-if="canFold">
    <div class="flex">
      <div class="space-x-1">
        <slot name="header" />
      </div>
      <div class="flex-grow" />
      <el-button
        class="my-[-5px] w-7!"
        text bg size="small"
        @click="showContent = !showContent"
      >
        <el-icon v-if="showContent" class="i-tabler:chevron-up" />
        <el-icon v-else class="i-tabler:chevron-down" />
      </el-button>
    </div>
    <el-collapse-transition>
      <div v-if="showContent" class="mt-3.5">
        <slot />
      </div>
    </el-collapse-transition>
  </el-card>
  <el-card v-else>
    <template #header>
      <slot name="header" />
    </template>
    <slot />
  </el-card>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  canFold?: boolean;
  defaultPosition?: 'folded' | 'unfolded';
}>(), {
  canFold: true,
  defaultPosition: 'unfolded',
});

const showContent = ref(true);
</script>
