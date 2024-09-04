<template>
  <el-card>
    <AdminBreadcrumb :auto-detect="false" parent-path="/admin/import/history" :current-name="id" />
    <template v-if="showHeader" #header>
      <el-icon class="i-tabler:package-import" />
      导入结果
    </template>
    <el-descriptions v-if="data?.createdAt || data?.importer" direction="vertical" :column="1" class="p-2">
      <el-descriptions-item>
        <template #label>
          <div class="text-[16px]!">
            <el-icon class="i-tabler:calendar-time" />
            导入时间
          </div>
        </template>
        <span class="text-[16px]!">
          {{ data?.createdAt?.toLocaleString('zh-CN') }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="text-[16px]!">
            <el-icon class="i-tabler:user" />
            导入者
          </div>
        </template>
        <el-tag class="cursor-pointer" @click="navigateTo(`/admin/user/${data?.importer?.id}`)">
          {{ data?.importer?.username }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <el-table :data="data?.data" class="w-full">
      <el-table-column type="expand">
        <template #default="rowData">
          <div class="pl-12">
            <el-table :data="rowData.row.passwords">
              <el-table-column type="index" />
              <el-table-column label="姓名" prop="username" />
              <el-table-column label="学号" prop="schoolId" />
              <el-table-column label="初始密码">
                <template #default="scope">
                  <span class="font-mono">
                    {{ scope.row.password }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="班级名" prop="name" />
      <el-table-column label="导入结果">
        <template #default="scope">
          <el-tag :type="scope.row.success ? 'success' : 'danger'">
            {{ scope.row.success ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button
            size="small"
            :disabled="!scope.row.passwords.length"
            @click="exportPassword(scope.row.name, scope.row.passwords)"
          >
            导出初始密码
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="mt-4">
      <el-button
        type="primary"
        :disabled="!data?.data?.some(x => x.passwords.length)"
        @click="exportAll"
      >
        导出全部初始密码
      </el-button>
      <el-button v-if="showRemove" type="danger" @click="openDeleteDialog">
        删除导入记录
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import writeXlsxFile from 'write-excel-file';

const { data, id } = defineProps<{
  showRemove: boolean;
  data?: Partial<TImportHistory>;
  id?: string;
  showHeader: boolean;
}>();

const { $api } = useNuxtApp();
const { mutate: removeMutation } = useMutation({
  mutationFn: $api.importHistory.remove.mutate,
  onSuccess: () => {
    useMessage({ message: '删除成功', type: 'success' });
    navigateTo('/admin/import/history');
  },
});

async function openDeleteDialog() {
  if (!id)
    return;

  await ElMessageBox.confirm(
    '确定要删除导入记录吗？删除后学生初始密码无法找回！',
    '删除导入记录',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  );
  removeMutation({ ids: [id] });
}

interface THistoryRow {
  username: string;
  schoolId: string;
  password: string;
}

async function exportPassword(className: string, passwords: THistoryRow[]) {
  const schema = [{
    column: '姓名',
    type: String,
    value: (x: THistoryRow) => x.username,
    width: 20,
  }, {
    column: '初始密码',
    type: String,
    value: (x: THistoryRow) => x.password,
    width: 30,
  }];

  await writeXlsxFile(passwords, {
    schema,
    fileName: `${className.replaceAll(' ', '-')}-初始密码.xlsx`,
  });
}

async function exportAll() {
  await Promise.all(
    (data?.data ?? [])
      .filter(x => x.passwords.length)
      .map(x => exportPassword(x.name, x.passwords)),
  );
}
</script>
