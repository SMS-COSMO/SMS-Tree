<template>
  <el-card class="h-content">
    <el-check-tag :checked="showAll" class="mb-2" @change="showAll = !showAll">
      展示所有班级
    </el-check-tag>
    <el-input
      v-model="searchContent"
      placeholder="搜索班级"
      prefix-icon="i-tabler:search"
    />

    <el-scrollbar>
      <div class="pb-20 pt-4">
        <el-table
          :data="processedListData"
          class="cursor-pointer"
          :default-sort="{ prop: 'className', order: 'ascending' }"
          @row-click="(row) => navigateTo(`/admin/class/${row.id}`)"
        >
          <el-table-column

            prop="className"
            label="班级"
            sortable show-overflow-tooltip
            :min-width="200"
          />
          <el-table-column :width="200" prop="teacher.username" label="教师" />
          <el-table-column
            :width="200" prop="enterYear" label="入学年份"
            :filters="enterYearOptions"
            :filter-method="enterYearFilterHandler"
          />
          <el-table-column :width="200" show-overflow-tooltip label="状态">
            <template #default="scope">
              <StateBadge
                :state="classStateTable.find(s => s.value === scope.row.state) ?? { label: '未知', type: 'info', value: '' }"
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

const showAll = ref(false);
const searchContent = ref('');

const userStore = useUserStore();
const { data: teacherClasses, suspense } = useQuery({
  queryKey: ['user.teacherClasses', { id: userStore.userId }],
  queryFn: () => $api.user.teacherClasses.query(userStore.userId),
});
await suspense();

const { processedListData, listData } = await useSearch<TClassListItem>(
  searchContent,
  templateSearchOption(['enterYear', 'teacher']),
  () => $api.class.list.query(),
  ['class.list'],
  e => e.item,
  (e) => {
    return showAll.value || (teacherClasses.value ?? []).includes(e.id);
  },
);

const enterYearOptions = Array.from(
  new Set(listData.value?.map(x => x.enterYear)),
).map(x => ({
  text: useClassGrade(x),
  value: x.toString(),
}));

function enterYearFilterHandler(value: string, row: TClassListItem) {
  return row?.enterYear.toString() === value;
}

onMounted(() => {
  const userStore = useUserStore();
  if (userStore.role === 'admin')
    showAll.value = true;
});
</script>
