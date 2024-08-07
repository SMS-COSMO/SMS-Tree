<template>
  <el-card class="min-h-admin-content">
    <AdminBreadcrumb />
    <div class="space-y-4">
      <el-alert
        title="危险"
        type="warning"
        description="操作不可撤销，请注意检查后再操作。"
        show-icon
        :closable="false"
      />

      <el-checkbox v-model="showMine" size="large" label="仅展示我的班级" border />
      <el-table
        ref="tableRef"
        :data="filteredList"
        class="cursor-pointer select-none"
        row-key="id"
        @selection-change="handleSelectionChange"
        @row-click="row => tableRef?.toggleRowSelection(row, !selected.includes(row))"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column
          prop="enterYear" label="年级" column-key="enterYear"
          :width="200"
          :filters="getOptions((x => x.enterYear), (x => x.toString()))"
          :filter-method="getFilterMethod(x => x.enterYear)"
        >
          <template #default="scope">
            {{ classGrade(scope.row.enterYear) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="index" label="班级"
          :width="200"
          sortable show-overflow-tooltip
        />
        <el-table-column
          prop="teacher.username" label="教师"
          :width="200"
          :filters="getOptions((x => x.teacher.username), (x => x.toString()))"
          :filter-method="getFilterMethod((x => x.teacher.username))"
        />
      </el-table>

      <el-button type="danger" :disabled="!selected.length" @click="showDeleteDialog = true">
        删除所选
      </el-button>
    </div>
  </el-card>

  <client-only>
    <el-dialog
      v-model="showDeleteDialog"
      title="确认删除班级"
      width="500"
    >
      <div class="space-y-1">
        <div class="bg-slate-50 p-2 rounded border-normal">
          <div class="p-1 text-[16px] font-bold">
            <el-icon class="i-tabler:trash" />
            确定要删除以下班级吗？
          </div>
          <el-tag v-for="c in selected" :key="c?.id" type="info" effect="plain" class="m-1 font-bold">
            {{ className(c) }}
          </el-tag>
        </div>
        <br>
        <el-text>
          请输入 <b>删除班级</b> 以确认
        </el-text>
        <el-input v-model="deleteConfirmation" />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDeleteDialog = false">
            取消
          </el-button>
          <el-button
            type="danger"
            :disabled="deleteConfirmation !== '删除班级'"
            :loading="isPending"
            @click="batchRemove({ ids: selected.map(x => x.id) })"
          >
            确认删除
          </el-button>
        </div>
      </template>
    </el-dialog>
  </client-only>
</template>

<script setup lang="ts">
import type { ElTable } from 'element-plus';

useHeadSafe({
  title: '删除班级',
});

const { $api } = useNuxtApp();
const { data: listData, suspense } = useQuery({
  queryKey: ['class.list'],
  queryFn: () => $api.class.list.query(),
});
await suspense();

const userStore = useUserStore();
const showMine = ref(userStore.role !== 'admin');
const { data: teacherClasses, suspense: teacherClassesSuspense } = useQuery({
  queryKey: ['user.teacherClasses', { id: userStore.userId }],
  queryFn: () => $api.user.teacherClasses.query(userStore.userId),
});
await teacherClassesSuspense();

const filteredList = computed(() =>
  listData?.value?.filter(x => !showMine.value || teacherClasses?.value?.some(e => e.id === x.id)),
);

type TClassRow = (Exclude<typeof listData.value, undefined>)[0];

function getOptions(
  propConvertor: (val: TClassRow, idx: number, arr: TClassRow[]) => string | number,
  textConvertor: (prop: string | number) => string,
) {
  return Array.from(
    new Set(listData.value?.map(propConvertor)),
  ).map(x => ({ text: textConvertor(x), value: x.toString() }));
}

function getFilterMethod(
  propConvertor: (val: TClassRow) => string | number,
) {
  return (match: string, row: TClassRow) => propConvertor(row).toString() === match;
};

const tableRef = ref<InstanceType<typeof ElTable>>();
const selected = ref<TClassRow[]>([]);
function handleSelectionChange(val: TClassRow[]) {
  selected.value = val;
}

const showDeleteDialog = ref(false);
const deleteConfirmation = ref('');

const queryClient = useQueryClient();
const { mutate: batchRemove, isPending } = useMutation({
  mutationFn: $api.class.batchRemove.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['class.list'] });
    useMessage({ message: '删除成功', type: 'success' });
    showDeleteDialog.value = false;
  },
  onError: err => useErrorHandler(err),
});
</script>
