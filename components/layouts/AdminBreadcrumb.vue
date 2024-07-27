<template>
  <el-icon class="i-tabler:map-pin ml-0.5 pb-0.5 contrast-1" />
  <el-breadcrumb v-if="chainList" class="mb-2.5 ml-1.5 mt-2.5" separator-icon="i-tabler:chevron-right">
    <template v-for="node in chainList" :key="node">
      <el-breadcrumb-item
        v-if="node.getName() && chainList.indexOf(node) === chainList.length - 1"
        :to="{ path: node.getPath() }"
      >
        {{ node.getName() }}
      </el-breadcrumb-item>
      <el-breadcrumb-item
        v-else-if="node.getName() && node.getPath()"
        :to="{ path: node.getPath() }"
      >
        {{ node.getName() }}
      </el-breadcrumb-item>
      <el-breadcrumb-item
        v-else-if="node.getName() && !node.getPath()"
      >
        {{ node.getName() }}
      </el-breadcrumb-item>
    </template>
  </el-breadcrumb>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  autoDetect?: boolean;
  parentPath?: string;
  currentName?: string;
}>(), {
  autoDetect: true,
  parentPath: '',
  currentName: '',
});

const route = useRoute();
const currentNode = props.autoDetect
  ? adminNavNodes.search(route.path)
  : new NavNode(props.currentName, route.path);
if (!props.autoDetect && currentNode)
  adminNavNodes.search(props.parentPath)?.addChildren(currentNode);
const chainList = currentNode?.getChainList();
</script>
