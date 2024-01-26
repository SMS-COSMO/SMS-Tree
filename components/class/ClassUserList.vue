<template>
  <div class="px-5">
    <h3>学生列表</h3>
    <el-table v-loading="loading" :default-sort="{ prop: 'projectName', order: 'ascending' }" :data="list">
      <el-table-column :width="150" label="学号" prop="id" />
      <el-table-column :width="150" label="姓名" sortable prop="username" />
      <el-table-column label="课题" sortable prop="projectName" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import type { TUserListOutputItem } from '~/types';

const props = defineProps<{
  students: string[];
}>();

const { $api } = useNuxtApp();
const list = ref<(TUserListOutputItem & { projectName: string | null })[]>([]);
const loading = ref(true);
onMounted(async () => {
  try {
    const getUser = async (id: string) => {
      const user = await $api.user.profile.query({ id });
      return useUserProjectName(user);
    };

    const req = [];
    for (const id of props.students)
      req.push(getUser(id));
    list.value = await Promise.all(req);
  } catch (err) {
    useErrorHandler(err);
  }
  loading.value = false;
});
</script>
