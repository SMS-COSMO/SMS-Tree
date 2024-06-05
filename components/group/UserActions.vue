<template>
  <el-dialog
    v-if="user"
    v-model="showDialog"
    title="用户操作"
    width="500"
    @close="user = undefined"
  >
    <div class="mb-4 flex bg-slate-50 p-3 rounded">
      <span class="text-[16px]">
        {{ user.username }}
      </span>
      <span class="ml-auto">
        {{ user.schoolId }}
      </span>
    </div>

    <el-button @click="changeGroupDialog = true">
      移动至其他小组
    </el-button>
    <template v-if="leader === user.id">
      <el-button type="primary" @click="removeLeader({ groupId })">
        取消组长
      </el-button>
    </template>
    <template v-else>
      <el-button type="primary" @click="becomeLeader({ userId: user.id, groupId })">
        设为组长
      </el-button>
    </template>
    <ChangeGroup v-model="changeGroupDialog" :user-id="user.id" :class-id="classId" :old-group-id="groupId" />
  </el-dialog>
</template>

<script setup lang="ts">
defineProps<{
  groupId: string;
  classId: string;
  leader?: string;
}>();

const user = defineModel<TMinimalUser | undefined>();
const showDialog = computed(() => user.value !== undefined);
const changeGroupDialog = ref(false);

const { $api } = useNuxtApp();
const queryClient = useQueryClient();

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
</script>
