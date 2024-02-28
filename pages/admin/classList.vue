<template>
  <el-card>
    <el-check-tag :checked="showAll" class="mb-3" @change="showAll = !showAll">
      展示所有班级
    </el-check-tag>
    <el-table v-loading="loading" :data="processedListData">
      <el-table-column type="expand" width="55" label="展开">
        <template #default="scope">
          <ClassUserList :data="scope.row" />
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip prop="className" label="名称">
        <template #header>
          <el-input v-model="searchContent" placeholder="搜索班级" style="height: 35px !important;" />
        </template>
      </el-table-column>
      <el-table-column :width="150" label="人数">
        <template #default="scope">
          {{ scope.row.students.length }}
        </template>
      </el-table-column>
      <el-table-column :width="150" prop="teacher" label="教师" />
      <el-table-column :width="150" prop="enterYear" label="入学年份" />
      <el-table-column :width="150" show-overflow-tooltip label="状态">
        <template #default="scope">
          <StateBadge :state="scope.row.state" />
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { templateSearchOption, useSearch } from '~/composables/useSearch';
import type { TClassListItem } from '~/types';

const { $api } = useNuxtApp();
useHeadSafe({
  title: '班级列表',
});

const showAll = ref(false);
const searchContent = ref('');
const { loading, processedListData } = useSearch<TClassListItem>(
  searchContent,
  templateSearchOption(['className', 'teacher']),
  async () => await $api.class.list.query(),
  e => e.item,
  (e) => {
    const userStore = useUserStore();
    return showAll.value || userStore.classIds.includes(e.id);
  },
);

onMounted(() => {
  const userStore = useUserStore();
  if (userStore.role === 'admin')
    showAll.value = true;
});
</script>
