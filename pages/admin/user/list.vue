<template>
  <el-card class="h-content">
    <el-input
      v-model="searchContent"
      placeholder="搜索学生"
      prefix-icon="i-tabler:search"
      @input="currentPage = 1"
    />
    <el-scrollbar>
      <div class="pb-10 pt-4">
        <el-table :data="processedListData">
          <el-table-column prop="schoolId" label="学号" width="160">
            <template #default="scope">
              <span class="cursor-pointer" @click="() => navigateTo(`/admin/user/${scope.row.id}`)">
                {{ scope.row.schoolId }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="username" label="姓名" width="100">
            <template #default="scope">
              <span class="cursor-pointer" @click="() => navigateTo(`/admin/user/${scope.row.id}`)">
                {{ scope.row.username }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="className" label="班级" width="120">
            <template #default="scope">
              <span class="cursor-pointer" @click="() => navigateTo(`/admin/class/${scope.row.classId}`)">
                {{ scope.row.className }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="projectName" label="课题" />
          <el-table-column prop="op" label="操作" width="250">
            <template #default="scope">
              <el-button size="small" @click="() => navigateTo(`/admin/user/${scope.row.id}?action=modify`)">
                <el-icon class="i-tabler:pencil" />
                修改
              </el-button>
              <el-popconfirm
                title="确定要删除此用户吗？"
                confirm-button-text="是"
                cancel-button-text="否"
                width="220"
                confirm-button-type="danger"
                @confirm="() => deleteUser(scope.row.id)"
              >
                <template #reference>
                  <el-button size="small" type="danger">
                    <el-icon class="i-tabler:trash" />
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          background
          layout="total, prev, pager, next, sizes, jumper"
          :total="searchListData.length"
          class="mt-4 justify-center"
        />
      </div>
    </el-scrollbar>
  </el-card>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp();
useHeadSafe({
  title: '学生列表',
});

const searchContent = ref('');
const { listData, processedListData: searchListData } = await useUserSearch(searchContent, 'student');

const currentPage = ref(1);
const pageSize = ref(20);

const processedListData = computed(() => searchListData.value.slice(
  (currentPage.value - 1) * pageSize.value,
  currentPage.value * pageSize.value,
));

async function deleteUser(id: string) {
  try {
    await $api.user.remove.mutate({ id });
    if (listData.value)
      listData.value.splice(listData.value.findIndex(e => e.id === id), 1);
  } catch (err) {
    useErrorHandler(err);
  }
}
</script>
