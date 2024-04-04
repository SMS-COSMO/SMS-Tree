<template>
  <el-card>
    <template #header>
      <span class="text-xl font-bold">请选择一个小组加入</span>
    </template>

    <el-table :data="availableGroups">
      <el-table-column prop="leader" label="组长" width="150">
        <template #default="{ row }">
          {{ row.leader ? row.leader.username : '还没有组长' }}
        </template>
      </el-table-column>
      <el-table-column prop="members" label="已有组员" min-width="400">
        <template #default="{ row }">
          <span v-if="!row.members.length">还没有组员~</span>
          <span v-else>
            <template v-for="member in row.members" :key="member.id">
              <el-tag class="m-1 font-bold" disable-transitions size="large">{{ member.username }}</el-tag>
            </template>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300">
        <template #default="{ row }">
          <el-button
            v-if="!userStore.groupIds.length"
            plain type="primary"
            @click="joinGroup({ groupId: row.id, userId: userStore.userId })"
          >
            加入
          </el-button>
          <template v-else-if="userStore.groupIds.includes(row.id)">
            <el-button type="danger" @click="leaveGroup({ userId: userStore.userId, groupId: row.id })">
              退出小组
            </el-button>
            <template v-if="row.leader?.id === userStore.userId">
              <el-button type="primary" @click="removeLeader({ groupId: row.id })">
                取消成为组长
              </el-button>
            </template>
            <template v-else>
              <el-button type="primary" @click="becomeLeader({ userId: userStore.userId, groupId: row.id })">
                成为组长
              </el-button>
            </template>
          </template>
          <el-button
            v-else
            plain @click="changeGroup({
              userId: userStore.userId,
              oldGroupId: userStore.groupIds[0],
              newGroupId: row.id,
            })"
          >
            更换为此小组
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

const { $api } = useNuxtApp();
const userStore = useUserStore();

const queryClient = useQueryClient();
const { data: availableGroups, suspense: availableGroupsSuspense } = useQuery({
  queryKey: ['availableGroups'],
  queryFn: () => useTrpcAsyncData(() => $api.group.list.query({ classId: userStore.classIds[0] })),
});
await availableGroupsSuspense();

const { mutate: joinGroup } = useMutation({
  mutationFn: $api.group.join.mutate,
  onSuccess: (message, input) => {
    queryClient.invalidateQueries({ queryKey: ['availableGroups'] });
    ElMessage.success(message);
    userStore.setGroupId([input.groupId]);
  },
  onError: err => useErrorHandler(err),
});

const { mutate: leaveGroup } = useMutation({
  mutationFn: $api.group.leave.mutate,
  onSuccess: (message) => {
    queryClient.invalidateQueries({ queryKey: ['availableGroups'] });
    ElMessage.success(message);
    userStore.setGroupId([]);
  },
  onError: err => useErrorHandler(err),
});

const { mutate: changeGroup } = useMutation({
  mutationFn: $api.group.change.mutate,
  onSuccess: (message, input) => {
    queryClient.invalidateQueries({ queryKey: ['availableGroups'] });
    ElMessage.success(message);
    userStore.setGroupId([input.newGroupId]);
  },
  onError: err => useErrorHandler(err),
});

const { mutate: becomeLeader } = useMutation({
  mutationFn: $api.group.setLeader.mutate,
  onSuccess: (message) => {
    queryClient.invalidateQueries({ queryKey: ['availableGroups'] });
    ElMessage.success(message);
  },
  onError: err => useErrorHandler(err),
});

const { mutate: removeLeader } = useMutation({
  mutationFn: $api.group.removeLeader.mutate,
  onSuccess: (message) => {
    queryClient.invalidateQueries({ queryKey: ['availableGroups'] });
    ElMessage.success(message);
  },
  onError: err => useErrorHandler(err),
});
</script>
