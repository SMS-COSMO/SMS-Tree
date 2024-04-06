<template>
  <el-card class="mb-5">
    <el-check-tag :checked="showAll" class="mb-2" @change="showAll = !showAll">
      展示所有班级
    </el-check-tag>
    <el-input
      v-model="searchContent"
      placeholder="搜索班级"
      class="h-[35px]!"
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
            :state="stateTable.find(s => s.value === scope.row.state) ?? { label: '未知', type: 'info', value: '' }"
            size="large"
          />
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { stateTable } from '~/constants/class';
import type { TClassListItem } from '~/types';

const { $api } = useNuxtApp();
useHeadSafe({
  title: '班级列表',
});

const showAll = ref(false);
const searchContent = ref('');

const userStore = useUserStore();
const { data: teacherClasses } = useQuery({
  queryKey: ['teacherClasses', { id: userStore.userId }],
  queryFn: () => $api.user.getTeacherClasses.query(userStore.userId),
});

const { processedListData } = await useSearch<TClassListItem>(
  searchContent,
  templateSearchOption(['className', 'teacher']),
  $api.class.list.query,
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
