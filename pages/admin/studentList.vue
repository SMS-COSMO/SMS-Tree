<template>
  <el-card>
    <el-table v-loading="loading" :data="processedListData">
      <el-table-column type="selection" width="55" />
      <el-table-column :width="150" show-overflow-tooltip prop="id" label="学号">
        <template #default="scope">
          <span style="cursor: pointer !important;" @click="visitProfile(scope.row.id)">
            {{ scope.row.id }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :width="100" show-overflow-tooltip prop="username" label="姓名" />
      <el-table-column :width="100" label="班级">
        <template #default="scope">
          <static-class-string :key="searchContent" :user-info="scope.row" />
        </template>
      </el-table-column>
      <el-table-column :width="400" show-overflow-tooltip label="课题" />
      <el-table-column label="操作" align="right">
        <template #header>
          <el-input v-model="searchContent" placeholder="搜索学生" />
        </template>
        <template #default="scope">
          <el-button size="small">
            修改
          </el-button>
          <el-popconfirm
            title="确定要删除此用户吗？" confirm-button-text="是" cancel-button-text="否" width="220"
            confirm-button-type="danger" @confirm="deleteUser(scope.row.id)"
          >
            <template #reference>
              <el-button size="small" type="danger">
                删除
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { useSearchStudent } from '~/composables/useSearch';

const { $api } = useNuxtApp();
useHeadSafe({
  title: '学生列表',
});

const searchContent = ref('');
const { listData, loading, processedListData } = useSearchStudent(searchContent);

function visitProfile(id: string) {
  navigateTo(`/user/${id}`);
}

async function deleteUser(id: string) {
  try {
    await $api.user.remove.mutate({ id });
    listData.value.splice(listData.value.findIndex(e => e.id === id), 1);
  } catch (err) {
    useErrorHandler(err);
  }
}
</script>
