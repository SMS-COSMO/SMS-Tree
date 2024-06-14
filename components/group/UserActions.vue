<template>
  <el-dialog
    v-if="user"
    v-model="showDialog"
    title="用户操作"
    width="500"
    @close="user = undefined; edited = false"
  >
    <div class="mb-4 flex bg-slate-50 p-3 rounded">
      <span class="text-[16px]">
        {{ user.username }}
      </span>
      <span class="ml-auto">
        {{ user.schoolId }}
      </span>
    </div>
    <select-group-from-class v-model="newGroupId" :class-id="classId" />
    <template #footer>
      <div class="dialog-footer">
        <el-button
          :loading="isPending"
          :disabled="newGroupId === groupId"
          @click="changeGroup({ userId: user.id, oldGroupId: groupId, newGroupId }); edited = true"
        >
          移动
        </el-button>
        <template v-if="leader === user.id">
          <el-button type="primary" @click="removeLeader({ groupId }); edited = true">
            取消组长
          </el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="becomeLeader({ userId: user.id, groupId }); edited = true">
            设为组长
          </el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
defineProps<{
  groupId: string;
  classId: string;
  leader?: string;
}>();

const user = defineModel<TMinimalUser | undefined>();
const edited = ref(false);
const showDialog = computed(() => (user.value !== undefined && edited?.value === false) ? true : undefined);

const { $api } = useNuxtApp();
const queryClient = useQueryClient();
const newGroupId = ref();

const { mutate: becomeLeader } = useMutation({
  mutationFn: $api.group.setLeader.mutate,
  onSuccess: (message) => {
    queryClient.invalidateQueries({ queryKey: ['class.info'] });
    useMessage({ message, type: 'success' });
  },
  onError: err => useErrorHandler(err),
});

const { mutate: removeLeader } = useMutation({
  mutationFn: $api.group.removeLeader.mutate,
  onSuccess: (message) => {
    queryClient.invalidateQueries({ queryKey: ['class.info'] });
    useMessage({ message, type: 'success' });
  },
  onError: err => useErrorHandler(err),
});

const { mutate: changeGroup, isPending } = useMutation({
  mutationFn: $api.group.change.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['class.info'] });
    useMessage({ message: '修改成功', type: 'success' });
  },
  onError: err => useErrorHandler(err),
});
</script>
