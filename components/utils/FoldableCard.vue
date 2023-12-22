<template>
  <el-card v-if="canFold">
    <div class="card-header">
      <slot name="header" />
      <el-button style="height: 30px !important; width: 30px !important;" text bg @click="showContent = !showContent">
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
  canFold?: boolean
  defaultPosition?: 'folded' | 'unfolded'
}>(), {
  canFold: true,
  defaultPosition: 'unfolded',
});

const showContent = ref(true);
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-enter-active,
.content-leave-active {
  transition: all .4s;
}

.content-enter,
.content-leave-active {
  transform: translate3d(0, 3rem, 0);
  opacity: 0;
}
</style>
