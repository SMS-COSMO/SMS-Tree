<template>
  <el-col :span="6" @click="jump">
    <div class="bottom-nav-button" :class="isHighlight ? 'highlighted' : ''">
      <el-icon :size="18" color="#606266">
        <slot name="icon"></slot>
      </el-icon>
      <br>
      <el-text size="small">{{ label }}</el-text>
    </div>
  </el-col>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string,
  href: string,
}>();

const route = useRoute();

const jump = () => {
  navigateTo(props.href);
};

const isHighlight = computed(() => route.fullPath === props.href);
</script>

<style scoped lang="scss">
.bottom-nav-button {
  height: 40px;
  margin: 8px;
  padding: 6px;
  text-align: center;
  border-radius: 10px;
  line-height: 0.95;
}

.highlighted {
  transition: all 0.2s ease;
  background-color: #F5F7FA;
}
</style>