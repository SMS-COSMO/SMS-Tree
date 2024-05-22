<template>
  <el-dialog
    v-model="dialogVisible"
    title="更改小组"
    width="500"
  >
    <select-group-from-class :class-id="classId" />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogVisible = false">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
defineProps<{
  classId: string;
}>();

const dialogVisible = defineModel<boolean>();
</script>
