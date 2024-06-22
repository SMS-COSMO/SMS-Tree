<template>
  <el-card>
    <el-table
      ref="tableRef"
      :data="data"
      class="cursor-pointer"
      @selection-change="handleSelectionChange"
      @row-click="row => navigateTo(`/admin/import/${row.id}`)"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID">
        <template #default="scope">
          <el-tag type="info">
            {{ scope.row.id }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="导入者">
        <template #default="scope">
          <el-tag class="cursor-pointer" @click="navigateTo(`/admin/user/${scope.row.importer.id}`)">
            {{ scope.row.importer.username }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="导入时间">
        <template #default="scope">
          {{ scope.row.createdAt.toLocaleString('zh-CN') }}
        </template>
      </el-table-column>
    </el-table>

    <el-button type="danger" :disabled="!selected.length" class="mt-4" @click="openDeleteDialog">
      删除所选
    </el-button>
  </el-card>
</template>

<script setup lang="ts">
import type { ElTable } from 'element-plus';

const { $api } = useNuxtApp();

const queryClient = useQueryClient();
const { data, suspense } = useQuery({
  queryKey: ['importHistory.list'],
  queryFn: () => $api.importHistory.list.query(),
});
await suspense();

type TImportHistoryRow = (Exclude<typeof data.value, undefined>)[0];
const tableRef = ref<InstanceType<typeof ElTable>>();
const selected = ref<TImportHistoryRow[]>([]);
function handleSelectionChange(val: TImportHistoryRow[]) {
  selected.value = val;
}

const { mutate: removeMutation } = useMutation({
  mutationFn: $api.importHistory.remove.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['importHistory.list'] });
    useMessage({ message: '删除成功', type: 'success' });
  },
});

async function openDeleteDialog() {
  await ElMessageBox.confirm(
    '确定要删除导入记录吗？删除后学生初始密码无法找回！',
    '删除导入记录',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  );

  removeMutation({ ids: selected.value.map(x => x.id) });
}
</script>
