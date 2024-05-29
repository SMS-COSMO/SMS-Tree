<template>
  <el-dialog
    v-model="showDialog"
    title="移动至小组"
    width="500"
    draggable
  >
    <select-group-from-class v-model="newGroupId" :class-id="classId" />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showDialog = false">
          取消
        </el-button>
        <el-button type="primary" :loading="isPending" @click="changeGroup({ userId, oldGroupId, newGroupId })">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
defineProps<{
  oldGroupId: string;
  classId: string;
  userId: string;
}>();

const showDialog = defineModel<boolean>();
const newGroupId = ref();

const { $api } = useNuxtApp();
const queryClient = useQueryClient();
const { mutate: changeGroup, isPending } = useMutation({
  mutationFn: $api.group.change.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['class.info'] });
    useMessage({ message: '修改成功', type: 'success' });
    showDialog.value = false;
  },
  onError: err => useErrorHandler(err),
});
</script>
