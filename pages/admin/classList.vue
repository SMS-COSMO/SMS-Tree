<template>
  <el-card>
    <el-check-tag :checked="showAll" class="mb-3" @change="showAll = !showAll">
      展示所有班级
    </el-check-tag>
    <el-table v-loading="loading" :data="processedListData" border>
      <el-table-column type="selection" width="55" />
      <el-table-column type="expand" width="55" label="展开">
        <template #default="scope">
          <ClassUserList :users="scope.row.users" />
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip prop="str" label="名称">
        <template #header>
          <el-input v-model="searchContent" placeholder="搜索班级" style="height: 35px !important;" />
        </template>
      </el-table-column>
      <el-table-column :width="150" label="人数">
        <template #default="scope">
          <!-- -1 for removing the teacher -->
          {{ scope.row.users.length - 1 }}
        </template>
      </el-table-column>
      <el-table-column :width="150" prop="enterYear" label="入学年份" />
      <el-table-column :width="150" show-overflow-tooltip label="状态">
        <template #default="scope">
          {{
            {
              archived: '已归档',
              initialized: '初始化',
              selectGroup: '选择小组',
              submitPaper: '提交论文',
            }[scope.row.state as 'archived' | 'initialized' | 'selectGroup' | 'submitPaper']
          }}
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { useSearch } from '~/composables/useSearch';
import type { TClassListOutputItem } from '~/types';

const { $api } = useNuxtApp();
useHeadSafe({
  title: '班级列表',
});

const showAll = ref(false);
const searchContent = ref('');
const { loading, processedListData } = useSearch<TClassListOutputItem>(
  searchContent,
  {
    fuseOptions: {
      keys: ['str'],
      shouldSort: true,
    },
    matchAllWhenSearchEmpty: true,
  },
  async () => (await $api.class.list.query()).map(e => ({ ...e, str: useClassString(e) })),
  e => e.item,
  (e) => {
    const userStore = useUserStore();
    return showAll.value || userStore.classIds.includes(e.id);
  },
);
</script>
