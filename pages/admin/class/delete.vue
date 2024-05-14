<template>
  <el-card>
    <div class="space-y-4">
      <el-alert
        title="危险！"
        type="error"
        description="操作不可撤销，请注意检查后再操作。"
        :closable="false"
      />

      <el-table
        :data="listData"
        class="cursor-pointer"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column
          :width="200"
          prop="enterYear"
          label="年级"
          column-key="enterYear"
          :filters="enterYearOptions"
          :filter-method="enterYearFilterHandler"
        >
          <template #default="scope">
            {{ useClassGrade(scope.row.enterYear) }}
          </template>
        </el-table-column>
        <el-table-column sortable prop="index" label="班级" :width="200" />
        <el-table-column
          :min-width="200"
          prop="teacher.username"
          label="教师"
          :filters="teacherOptions"
          :filter-method="teacherFilterHandler"
        />
      </el-table>

      <el-button :disabled="!selected.length" @click="showDeleteDialog = true">
        删除选中的班级
      </el-button>
    </div>
  </el-card>

  <client-only>
    <el-dialog
      v-model="showDeleteDialog"
      title="删除班级"
      width="500"
      draggable
    >
      <div class="space-y-1">
        <div class="bg-slate-50 p-2 rounded border-normal">
          <div class="p-1 text-[16px] font-bold">
            确定要删除以下班级吗？
          </div>
          <el-tag v-for="c in selected" :key="c?.id" type="info" effect="plain" class="m-1 font-bold">
            {{ useClassName(c) }}
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
          <el-button type="danger" :disabled="deleteConfirmation !== '删除班级'" @click="showDeleteDialog = false">
            确认删除
          </el-button>
        </div>
      </template>
    </el-dialog>
  </client-only>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp();
const { data: listData, suspense } = useQuery({
  queryKey: ['class.list'],
  queryFn: () => $api.class.list.query(),
});
await suspense();

const enterYearOptions = Array.from(
  new Set(listData.value?.map(x => x.enterYear)),
).map(x => ({
  text: useClassGrade(x),
  value: x.toString(),
}));

const teacherOptions = Array.from(
  new Set(listData.value?.map(x => x.teacher.username)),
).map(x => ({
  text: x,
  value: x,
}));

type TClassRow = (Exclude<typeof listData.value, undefined>)[0];

function enterYearFilterHandler(value: string, row: TClassRow) {
  return row?.enterYear.toString() === value;
}
function teacherFilterHandler(value: string, row: TClassRow) {
  return row?.teacher.username === value;
}

const selected = ref<TClassRow[]>([]);
function handleSelectionChange(val: TClassRow[]) {
  selected.value = val;
}

const showDeleteDialog = ref(false);
const deleteConfirmation = ref('');
</script>
