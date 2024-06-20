<template>
  <span v-if="interactive" class="space-x-1">
    <el-tag
      v-for="(keyword, index) in keywords" :key="index"
      effect="plain" type="info"
      class="my-1 cursor-pointer" @click="searchTag(keyword)"
    >
      {{ keyword }}
    </el-tag>
  </span>
  <span v-else class="space-x-1">
    <el-tag
      v-for="(keyword, index) in keywords" :key="index"
      effect="plain" type="info"
      class="my-1" disable-transitions
    >
      {{ keyword }}
    </el-tag>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  keywords?: string[];
  interactive?: boolean;
}>(), {
  interactive: true,
});

function searchTag(keyword: string) {
  navigateTo({
    path: '/paper/list',
    query: {
      search: keyword,
    },
  });
}
</script>
