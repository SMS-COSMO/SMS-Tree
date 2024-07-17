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
        <template v-if="groupId">
          <template v-if="leader === user.id">
            <el-button @click="removeLeader({ groupId })">
              取消组长
            </el-button>
          </template>
          <template v-else>
            <el-button @click="becomeLeader({ userId: user.id, groupId })">
              设为组长
            </el-button>
          </template>
        </template>
        <el-button
          type="primary"
          :loading="changePending || joinPending"
          :disabled="newGroupId === groupId"
          @click="moveAction"
        >
          移动
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  groupId?: string;
  classId: string;
  leader?: string;
}>();

const user = defineModel<TMinimalUser | undefined>();
const edited = ref(false);
const showDialog = computed(() => (user.value !== undefined && edited?.value === false) ? true : undefined);

const { $api } = useNuxtApp();
const queryClient = useQueryClient();

const newGroupId = ref();
watch(user, () => {
  newGroupId.value = undefined;
});

const { mutate: becomeLeader } = useMutation({
  mutationFn: $api.group.setLeader.mutate,
  onSuccess: (message) => {
    queryClient.invalidateQueries({ queryKey: ['class.info'] });
    useMessage({ message, type: 'success' });
    edited.value = true;
  },
  onError: err => useErrorHandler(err),
});

const { mutate: removeLeader } = useMutation({
  mutationFn: $api.group.removeLeader.mutate,
  onSuccess: (message) => {
    queryClient.invalidateQueries({ queryKey: ['class.info'] });
    useMessage({ message, type: 'success' });
    edited.value = true;
  },
  onError: err => useErrorHandler(err),
});

const { mutate: changeGroup, isPending: changePending } = useMutation({
  mutationFn: $api.group.change.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['class.info'] });
    useMessage({ message: '修改成功', type: 'success' });
    edited.value = true;
  },
  onError: err => useErrorHandler(err),
});

const { mutate: joinGroup, isPending: joinPending } = useMutation({
  mutationFn: $api.group.join.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['class.info'] });
    useMessage({ message: '修改成功', type: 'success' });
    edited.value = true;
  },
  onError: err => useErrorHandler(err),
});

function moveAction() {
  if (!user.value)
    return;

  if (props.groupId) {
    changeGroup({
      userId: user.value.id,
      oldGroupId: props.groupId,
      newGroupId: newGroupId.value,
    });
  } else {
    joinGroup({
      userId: user.value.id,
      groupId: newGroupId.value,
    });
  }
  newGroupId.value = undefined;
}
</script>
