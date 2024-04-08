<template>
  <el-card class="cursor-pointer hover:border-color-[#D4D7DE]! hover:bg-hover-bg!" @click="dialogVisible = true">
    <el-icon class="i-tabler:plus" />
    <span class="text-[16px]">
      创建新的活动记录
    </span>
  </el-card>

  <client-only>
    <el-dialog
      v-model="dialogVisible"

      draggable align-center
      title="创建活动记录"
      class="my-4"
    >
      <NoteForm type="create" />
    </el-dialog>
  </client-only>
</template>

<script setup lang="ts">
const dialogVisible = ref(false);
</script>
