<template>
  <el-card v-if="canFold">
    <div class="flex items-center justify-between">
      <slot name="header" />
      <el-button
        class="h-8! w-7!"
        text bg size="small"
        @click="showContent = !showContent"
      >
        <el-icon color="#909399">
          <ElIconArrowUpBold v-if="showContent" />
          <ElIconArrowDownBold v-else />
        </el-icon>
      </el-button>
    </div>
    <div v-if="showContent" class="mt-3.5">
      <slot />
    </div>
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
