<template>
  <div class="px-5">
    <h3>操作</h3>
    <div class="flex flex-col">
      <div v-if="data.state === 'initialized'" class="flex flex-row gap-2">
        <el-input-number v-model="newGroupCount" />
        <el-button
          @click="createEmptyGroups({
            id: data.id,
            amount: newGroupCount,
          })"
        >
          创建空白小组
        </el-button>
      </div>
      <div>
        <h4>修改状态</h4>
        <state-select v-model="newState" />
      </div>
    </div>
    <h3>学生列表</h3>
    <el-table :default-sort="{ prop: 'projectName', order: 'descending' }" :data="studentProfileList">
      <el-table-column :width="200" label="学号" prop="schoolId">
        <template #default="scope">
          <span class="cursor-pointer" @click="navigateTo(`/admin/user/${scope.row.id}`)">
            {{ scope.row.schoolId }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :width="200" label="姓名" sortable prop="username">
        <template #default="scope">
          <span class="cursor-pointer" @click="navigateTo(`/admin/user/${scope.row.id}`)">
            {{ scope.row.username }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="课题" sortable prop="projectName" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query';
import type { TClassListItem } from '~/types';

const props = defineProps<{
  data: TClassListItem;
}>();

const { $api } = useNuxtApp();

const studentProfileList = await useTrpcAsyncData(
  () => Promise.all(props.data.students.map(id => $api.user.profile.query({ id }))),
);

const newGroupCount = ref(8);
const newState = ref(props.data.state);

const { mutate: modifyState } = useMutation({
  mutationFn: $api.class.modifyState.mutate,
  onError: err => useErrorHandler(err),
});

watch(newState, () => modifyState({ id: props.data.id, newState: newState.value }));

const { mutate: createEmptyGroups } = useMutation({
  mutationFn: $api.class.initGroups.mutate,
  onSuccess: () => {
    useElMessage({ type: 'success', message: '创建成功' });
  },
  onError: err => useErrorHandler(err),
});
</script>
