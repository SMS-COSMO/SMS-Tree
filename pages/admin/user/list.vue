<template>
  <el-card class="h-admin-content">
    <div class="flex flex-col gap-2 lg:flex-row">
      <el-select-v2
        v-model="classFilter"
        :options="classFilterOptions"
        placeholder="筛选班级"
        multiple
        clearable
        collapse-tags
        class="lg:basis-1/6"
      />
      <el-input
        v-model="searchContent"
        placeholder="搜索学生（可搜索 学号/姓名/班级/课题名）"
        prefix-icon="i-tabler:search"
        class="lg:basis-5/6"
        @input="currentPage = 1"
      />
    </div>
    <el-scrollbar>
      <div class="pb-24 pt-4 lg:pb-16">
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
          <el-table-column prop="projectName" label="课题" min-width="400" />
          <el-table-column prop="op" label="操作" width="250">
            <template #default="scope">
              <el-button size="small" @click="() => navigateTo(`/admin/user/${scope.row.id}?action=modify`)">
                <el-icon class="i-tabler:edit" />
                修改
              </el-button>
              <el-popconfirm
                title="确定要删除此用户吗？"
                confirm-button-text="是"
                cancel-button-text="否"
                width="220"
                confirm-button-type="danger"
                @confirm="() => deleteUser({ id: scope.row.id })"
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
          :total="filteredList.length"
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
const queryClient = useQueryClient();
const { processedListData: searchListData } = await useUserSearch(searchContent, 'student');

const currentPage = ref(1);
const pageSize = ref(20);

const classFilterOptions = computed(
  () => searchListData.value.map(
    x => ({
      value: x.classId,
      label: x.className,
    }),
  ).filter((a, i, arr) =>
    arr.findIndex(b => (b.value === a.value)) === i,
  ),
);
const classFilter = ref<string[]>([]);

const filteredList = computed(
  () => searchListData.value
    .filter(x => classFilter.value.length ? classFilter.value.includes(x.classId) : true),
);

const processedListData = computed(
  () => filteredList.value
    .slice(
      (currentPage.value - 1) * pageSize.value,
      currentPage.value * pageSize.value,
    ),
);

const { mutate: deleteUser } = useMutation({
  mutationFn: $api.user.remove.mutate,
  onSuccess: () => {
    useMessage({ message: '删除成功', type: 'success' });
    queryClient.invalidateQueries({ queryKey: ['user.list', { role: 'student' }] });
  },
  onError: err => useErrorHandler(err),
});
</script>
