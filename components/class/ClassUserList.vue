<template>
  <div class="px-5">
    <h3>操作</h3>
    <div class="flex flex-col">
      <div v-if="data.state === 'initialized'" class="flex flex-row gap-2">
        <el-input-number v-model="newGroupCount" />
        <el-button @click="createEmptyGroups">
          创建空白小组
        </el-button>
      </div>
      <div>
        <h4>修改状态</h4>
        <state-select v-model="newState" />
      </div>
    </div>
    <h3>学生列表</h3>
    <el-table v-loading="loading" :default-sort="{ prop: 'projectName', order: 'descending' }" :data="list">
      <el-table-column :width="150" label="学号" prop="id" />
      <el-table-column :width="150" label="姓名" sortable prop="username" />
      <el-table-column label="课题" sortable prop="projectName" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import type { TClassListItem, TUserListItem } from '~/types';

const props = defineProps<{
  data: TClassListItem;
}>();

const { $api } = useNuxtApp();
const list = ref<TUserListItem[]>([]);

const newGroupCount = ref(8);
const newState = ref(props.data.state);

watch(newState, async () => {
  // TODO Modify state
});

async function createEmptyGroups() {
  try {
    await $api.class.initGroups.mutate({
      id: props.data.id,
      amount: newGroupCount.value,
    });

    ElMessage({ type: 'success', message: '创建成功', showClose: true });
  } catch (err) {
    useErrorHandler(err);
  }
}

const loading = ref(true);
onMounted(async () => {
  try {
    list.value = await Promise.all(props.data.students.map(id => $api.user.profile.query({ id })));
  } catch (err) {
    useErrorHandler(err);
  }
  loading.value = false;
});
</script>
