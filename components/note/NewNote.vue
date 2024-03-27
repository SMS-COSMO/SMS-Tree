<template>
  <el-card class="mb-2 cursor-pointer lg:mb-2.5 hover:border-color-[#D4D7DE]! hover:bg-hover-bg!" @click="dialogVisible = true">
    <el-icon size="16px">
      <ElIconPlus />
    </el-icon>
    <span class="text-[16px]">
      创建新的活动记录
    </span>
  </el-card>

  <client-only>
    <el-dialog
      v-model="dialogVisible"
      align-center
      draggable
      title="创建活动记录"
    >
      <NoteForm type="create" />
    </el-dialog>
  </client-only>
</template>

<script setup lang="ts">
const dialogVisible = ref(false);
</script>
