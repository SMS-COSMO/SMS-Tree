<template>
  <el-tag
    v-if="interactive" effect="light" type="warning"
    class="cursor-pointer" @click="searchCategory(categoryId)"
  >
    {{ getCategoryName(categoryId) }}
  </el-tag>
  <el-tag v-else effect="light" type="warning" disable-transitions>
    {{ getCategoryName(categoryId) }}
  </el-tag>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  categoryId?: number | undefined;
  interactive?: boolean;
}>(), {
  interactive: true,
});

function searchCategory(id: number | undefined) {
  navigateTo({
    path: '/paper/list',
    query: {
      category: id,
    },
  });
}
</script>
