<template>
  <el-card class="mb-5">
    <el-check-tag :checked="showAll" class="mb-2" @change="showAll = !showAll">
      展示所有班级
    </el-check-tag>
    <el-input
      v-model="searchContent"
      placeholder="搜索班级"
      class="h-[35px]!"
      prefix-icon="i-tabler:search"
    />

    <el-table
      :data="processedListData"
      class="cursor-pointer"
      @row-click="(row) => navigateTo(`/admin/class/${row.id}`)"
    >
      <el-table-column show-overflow-tooltip prop="className" label="班级" :min-width="200">
        <template #header />
      </el-table-column>
      <el-table-column :width="200" prop="teacher.username" label="教师" />
      <el-table-column :width="200" prop="enterYear" label="入学年份" />
      <el-table-column :width="200" show-overflow-tooltip label="状态">
        <template #default="scope">
          <StateBadge
            :state="classStateTable.find(s => s.value === scope.row.state) ?? { label: '未知', type: 'info', value: '' }"
            size="large"
          />
        </template>
      </el-table-column>
    </el-table>
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
  queryKey: ['teacherClasses', { id: userStore.userId }],
  queryFn: () => $api.user.teacherClasses.query(userStore.userId),
});
await suspense();

const { processedListData } = await useSearch<TClassListItem>(
  searchContent,
  templateSearchOption(['className', 'teacher']),
  () => $api.class.list.query(),
  ['classSearch'],
  e => e.item,
  (e) => {
    return showAll.value || (teacherClasses.value ?? []).includes(e.id);
  },
);

onMounted(() => {
  const userStore = useUserStore();
  if (userStore.role === 'admin')
    showAll.value = true;
});
</script>
