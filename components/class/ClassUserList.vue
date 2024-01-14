<template>
  <div class="px-5">
    <h3>班级人员</h3>
    <el-table v-loading="loading" :data="list">
      <el-table-column :width="150" label="学号" prop="id" />
      <el-table-column :width="150" label="姓名" prop="username" />
      <el-table-column label="课题" prop="projectName" />
      <el-table-column :width="150" label="角色">
        <template #default="scope">
          <el-tag :type="scope.row.role === 'student' ? 'info' : 'success'">
            {{
              {
                student: '学生',
                teacher: '教师',
                admin: '管理员',
              }[scope.row.role as 'admin' | 'student' | 'teacher']
            }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import type { TUserListOutputItem } from '~/types';

const props = defineProps<{
  users: string[]
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
    for (const id of props.users)
      req.push(getUser(id));
    list.value = await Promise.all(req);
    loading.value = false;
  } catch (err) {
    useErrorHandler(err);
    loading.value = false;
  }
});
</script>
