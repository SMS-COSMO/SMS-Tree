<template>
  <el-card class="h-admin-content">
    <AdminBreadcrumb />
    <div class="flex flex-col gap-3 md:flex-row">
      <el-checkbox v-model="showMine" size="large" label="仅展示我的班级" border />
      <el-input
        v-model="searchContent"
        placeholder="搜索班级"
        prefix-icon="i-tabler:search"
      />
    </div>

    <el-scrollbar>
      <div class="pb-20 pt-4">
        <el-table
          class="cursor-pointer"
          empty-text="没有查询到数据，请检查您的筛选条件"
          :data="processedListData"
          :default-sort="{ prop: 'className', order: 'ascending' }"
          @row-click="(row) => navigateTo(`/admin/class/${row.id}`)"
        >
          <el-table-column
            prop="className" label="班级"
            sortable show-overflow-tooltip
            :min-width="200"
          />
          <el-table-column
            :width="200" prop="teacher.username" label="教师"
            :filters="getOptions((x => x.teacher.username), (x => x.toString()))"
            :filter-method="getFilterMethod(x => x.teacher.username)"
          />
          <el-table-column
            :width="200" prop="enterYear" label="入学年份"
            :filters="getOptions((x => x.enterYear), (x => x.toString()))"
            :filter-method="getFilterMethod(x => x.enterYear)"
          />
          <el-table-column
            :width="200" show-overflow-tooltip label="状态"
            :filters="getOptions((x => x.state), (x => useClassState(x.toString()).label))"
            :filter-method="getFilterMethod(x => x.state)"
          >
            <template #default="scope">
              <StateBadge
                :state="useClassState(scope.row.state)"
                size="large"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-scrollbar>
  </el-card>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp();
useHeadSafe({
  title: '班级列表',
});
const userStore = useUserStore();

const showMine = ref(userStore.role !== 'admin');
const searchContent = ref('');

const { data: teacherClasses, suspense } = useQuery({
  queryKey: ['user.teacherClasses', { id: userStore.userId }],
  queryFn: () => $api.user.teacherClasses.query(userStore.userId),
});
await suspense();

const { processedListData, listData } = await useSearch<TClassListItem>(
  searchContent,
  templateSearchOption(['enterYear', 'teacher.username', 'index']),
  () => $api.class.list.query(),
  ['class.list'],
  e => e.item,
  (e) => {
    return !showMine.value || (teacherClasses.value ?? []).some(x => x.id === e.id);
  },
);

function getOptions(
  propConvertor: (val: TClassListItem, idx: number, arr: TClassListItem[]) => string | number,
  textConvertor: (prop: string | number) => string,
) {
  return Array.from(
    new Set(listData.value?.map(propConvertor)),
  ).map(x => ({ text: textConvertor(x), value: x.toString() }));
}

function getFilterMethod(
  propConvertor: (val: TClassListItem) => string | number,
) {
  return (match: string, row: TClassListItem) => propConvertor(row).toString() === match;
};
</script>
