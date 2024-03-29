<template>
  <el-card class="mb-5 w-full">
    <el-input v-model="searchContent" placeholder="搜索学生" />
    <div class="h-[calc(100vh-190px)]">
      <el-auto-resizer>
        <template #default="{ height, width }">
          <el-table-v2
            :columns="columns"
            :data="processedListData"
            :width="width"
            :height="height"
          />
        </template>
      </el-auto-resizer>
    </div>
  </el-card>
</template>

<script setup lang="tsx">
import { type Column, TableV2FixedDir } from 'element-plus';

const { $api } = useNuxtApp();
useHeadSafe({
  title: '学生列表',
});

const searchContent = ref('');
const { listData, processedListData } = await useUserSearch(searchContent, 'student');

async function deleteUser(id: string) {
  try {
    await $api.user.remove.mutate({ id });
    listData.value.splice(listData.value.findIndex(e => e.id === id), 1);
  } catch (err) {
    useErrorHandler(err);
  }
}

const columns: Column<any>[] = [
  {
    key: 'id',
    dataKey: 'id',
    width: 120,
    title: '学号',
    cellRenderer: ({ cellData: id }) => (
      <span class="cursor-pointer" onClick={() => navigateTo(`/admin/user/${id}`)}>
        {id}
      </span>
    ),
  },
  {
    key: 'username',
    dataKey: 'username',
    width: 100,
    title: '姓名',
    cellRenderer: ({ cellData: username, rowIndex }) => (
      <span class="cursor-pointer" onClick={() => navigateTo(`/admin/user/${processedListData.value[rowIndex].id}`)}>
        {username}
      </span>
    ),
  },
  {
    key: 'className',
    dataKey: 'className',
    width: 120,
    title: '班级',
    cellRenderer: ({ cellData: className, rowIndex }) => (
      <span class="cursor-pointer" onClick={() => navigateTo(`/admin/class/${processedListData.value[rowIndex].classIds[0]}`)}>
        {className}
      </span>
    ),
  },
  {
    key: 'projectName',
    dataKey: 'projectName',
    width: 400,
    title: '课题',
  },
  {
    key: 'op',
    dataKey: 'id',
    width: 170,
    flexShrink: 1,
    fixed: TableV2FixedDir.RIGHT,
    align: 'right',
    title: '操作',
    cellRenderer: ({ cellData: id }) => (
      <span>
        <el-button size="small" onClick={() => navigateTo(`/admin/user/${id}`)}>
          修改
        </el-button>
        <el-popconfirm
          title="确定要删除此用户吗？"
          confirm-button-text="是"
          cancel-button-text="否"
          width="220"
          confirm-button-type="danger"
          onConfirm={() => deleteUser(id)}
        >
          {{
            reference: () => (
              <el-button size="small" type="danger">
                删除
              </el-button>
            ),
          }}
        </el-popconfirm>
      </span>
    ),
  },
];
</script>
