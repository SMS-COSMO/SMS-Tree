<template>
  <el-card class="mb-5 w-full">
    <el-check-tag :checked="showAll" class="mb-3" @change="showAll = !showAll">
      展示所有班级
    </el-check-tag>
    <el-table :data="processedListData">
      <el-table-column type="expand" width="55" label="展开">
        <template #default="scope">
          <ClassUserList :data="scope.row" />
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip prop="className" label="名称">
        <template #header>
          <el-input
            v-model="searchContent"
            placeholder="搜索班级"
            class="h-[35px]!"
          />
        </template>
      </el-table-column>
      <el-table-column :width="200" label="人数">
        <template #default="scope">
          {{ scope.row.students.length }}
        </template>
      </el-table-column>
      <el-table-column :width="200" prop="teacher" label="教师" />
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
import { stateTable } from '~/constants/class';
import type { TClassListItem } from '~/types';

const { $api } = useNuxtApp();
useHeadSafe({
  title: '班级列表',
});

const showAll = ref(false);
const searchContent = ref('');
const { processedListData } = await useSearch<TClassListItem>(
  searchContent,
  templateSearchOption(['className', 'teacher']),
  $api.class.list.query,
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
