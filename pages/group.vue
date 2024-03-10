<template>
  <template v-if="!classInfo">
    <el-card>
      <template #header>
        <span class="text-xl font-bold">错误</span>
      </template>
      无法获取班级信息，请刷新页面重试
    </el-card>
  </template>
  <template v-else>
    <el-card v-if="classInfo.state === 'initialized'">
      <template #header>
        <span class="text-xl font-bold">等待老师开启小组选择</span>
      </template>
      老师还没有开启小组选择，请耐心等待~
    </el-card>
    <el-card v-else-if="classInfo.state === 'selectGroup'">
      <template #header>
        <span class="text-xl font-bold">请选择一个小组加入</span>
      </template>

      <el-table :data="availableGroups" stripe>
        <el-table-column prop="leader" label="组长" width="200">
          <template #default="{ row }">
            {{ row.leader ? row.leader.username : '还没有组长' }}
          </template>
        </el-table-column>
        <el-table-column prop="members" label="已有组员">
          <template #default="{ row }">
            <span v-if="!row.members.length">还没有组员~</span>
            <span v-else class="space-x-2">
              <template v-for="member in row.members" :key="member.id">
                <el-tag class="font-bold" disable-transitions size="large">{{ member.username }}</el-tag>
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
    <el-row v-else-if="classInfo.state === 'submitPaper'" :gutter="20">
      <el-col :span="22">
        <el-space direction="vertical" class="w-full" :size="20" fill>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card>
                <el-descriptions :column="2" :border="true">
                  <el-descriptions-item label="班级" />
                  <el-descriptions-item label="" />
                  <el-descriptions-item label="小组成员" :span="2" />
                </el-descriptions>
              </el-card>
            </el-col>
            <el-col :span="16">
              <el-card>
                <template #header>
                  Stats
                </template>
              </el-card>
            </el-col>
          </el-row>

          <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="上传" name="first">
              <el-upload drag multiple>
                <el-icon class="el-icon--upload">
                  <ElIconUploadFilled />
                </el-icon>
                <div class="el-upload__text">
                  拖拽文件或 <em>点击这里上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    Place Holder
                  </div>
                </template>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane label="已上传文件" name="second">
              <client-only>
                <el-collapse>
                  <el-collapse-item title="Placeholder">
                    placeholder
                  </el-collapse-item>
                </el-collapse>
              </client-only>
            </el-tab-pane>
          </el-tabs>

          <el-card>
            laos
          </el-card>
        </el-space>
      </el-col>

      <el-col :span="2">
        <div class="h-[500px]">
          <client-only>
            <el-steps direction="vertical" :active="1">
              <el-step :icon="ElIconUpload" title="提交" />
              <el-step :icon="ElIconCircleCheck" title="查重" />
              <el-step :icon="ElIconEdit" title="批改" />
            </el-steps>
          </client-only>
        </div>
      </el-col>
    </el-row>
  </template>
</template>

<script lang="ts" setup>
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

const { $api } = useNuxtApp();
const userStore = useUserStore();
const queryClient = useQueryClient();
const activeTab = ref('first');

const [classInfo, userInfo] = await useTrpcAsyncData(() => Promise.all([
  $api.class.content.query({ id: userStore.classIds[0] }),
  $api.user.profile.query({ id: userStore.userId }),
])) ?? [];

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

onMounted(() => {
  if (userInfo)
    userStore.groupIds = userInfo.groupIds;
});
</script>
