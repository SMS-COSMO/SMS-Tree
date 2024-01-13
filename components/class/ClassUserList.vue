<template>
  <div class="px-5">
    <h3>班级人员</h3>
    <el-table :data="list">
      <el-table-column :width="150" label="学号" prop="id" />
      <el-table-column :width="150" label="姓名" prop="username" />
      <el-table-column label="课题" prop="groupIds" />
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
import type { TUserListOutput } from '~/types';

const props = defineProps<{
  users: string[]
}>();

const { $api } = useNuxtApp();
const list = ref<TUserListOutput>([]);
onMounted(async () => {
  try {
    const req = [];
    for (const id of props.users)
      req.push($api.user.profile.query({ id }));
    list.value = await Promise.all(req);
  } catch (err) {
    useErrorHandler(err);
  }
});
</script>
