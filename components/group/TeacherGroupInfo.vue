<template>
  <el-card>
    <template #header>
      <div class="flex gap-2">
        <el-tag type="info" effect="plain" class="select-none self-center">
          小组 {{ index }}
        </el-tag>
        <span class="self-center font-bold">
          {{ info?.projectName ?? '暂无课题名' }}
        </span>
        <el-popover
          v-if="info"
          placement="bottom"
          title="修改课题名"
          :width="300"
          trigger="click"
        >
          <template #reference>
            <el-link icon="i-tabler:edit" class="self-center text-[14px]!">
              修改
            </el-link>
          </template>
          <el-input v-model="newProjectName" @blur="edit = false">
            <template #append>
              <el-button :loading="isPending" @click="modifyProjectName({ groupId: info!.id, newProjectName })">
                <el-icon class="i-tabler:check" />
              </el-button>
            </template>
          </el-input>
        </el-popover>
        <el-popconfirm
          v-if="info"
          title="确定要删除小组吗？"
          width="200"
          confirm-button-type="danger"
          hide-icon
          @confirm="removeGroup({ id: info!.id })"
        >
          <template #reference>
            <el-link icon="i-tabler:trash" type="danger" class="ml-auto self-center">
              删除
            </el-link>
          </template>
        </el-popconfirm>
      </div>
    </template>
    <el-descriptions
      :column="1"
      size="large"
    >
      <el-descriptions-item>
        <template #label>
          <div class="text-[16px]!">
            <el-icon class="i-tabler:user" />
            组长
          </div>
        </template>
        <span class="text-[16px]!">
          <el-link :href="`/user/${info?.leader?.id}`">
            {{ info?.leader?.username }}
          </el-link>
        </span>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="mb-[-12px] text-[16px]!">
            <el-icon class="i-tabler:users" />
            小组成员
            <el-tag type="info" effect="plain" size="small" class="mb-1 ml-1 font-normal">
              {{ info?.members.length }} 人
            </el-tag>
          </div>
        </template>
        <el-table
          :data="info?.members"
          class="cursor-pointer"
          @row-contextmenu="row => changeGroupUser = row"
          @contextmenu.prevent
          @cell-click="(row, col) => {
            if (col.getColumnIndex() < 2) {
              navigateTo(`/admin/user/${row.id}`)
            }
          }"
        >
          <el-table-column prop="username" label="姓名">
            <template #default="scope">
              <span :class="[info?.leader?.id === scope.row.id && 'font-bold']">
                {{ scope.row.username }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="schoolId" label="学号" />
          <el-table-column width="100" align="right">
            <template #default="scope">
              <div @click="() => changeGroupUser = scope.row">
                <el-icon class="i-tabler:settings-2" />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-descriptions-item>
      <el-descriptions-item v-if="info?.notes?.length">
        <template #label>
          <div class="mb-[-12px] text-[16px]!">
            <el-icon class="i-tabler:clipboard" />
            活动记录
          </div>
        </template>
        <div :class="[(info?.notes?.length ?? 0) > 1 && 'grid grid-cols-2 gap-2']">
          <template v-for="note in info?.notes" :key="note.id">
            <NoteCard admin :note="note" />
          </template>
        </div>
      </el-descriptions-item>
      <el-descriptions-item v-if="info?.reports?.length">
        <template #label>
          <div class="mb-[-12px] text-[16px]!">
            <el-icon class="i-tabler:presentation" />
            报告
          </div>
        </template>
        <div class="grid grid-cols-2 gap-2">
          <template v-for="report in info?.reports" :key="report.id">
            <ReportCard :report="report" is-admin :class-id="info?.classId ?? undefined" />
          </template>
        </div>
      </el-descriptions-item>
      <el-descriptions-item v-if="info?.paper">
        <template #label>
          <div class="mb-[-12px] text-[16px]!">
            <el-icon class="i-tabler:file-text" />
            论文
          </div>
        </template>
        <PaperCard :paper="info?.paper" :show-authors="false" is-admin />
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
  <UserActions
    v-if="info?.classId"
    v-model="changeGroupUser"
    :class-id="info.classId"
    :group-id="info.id"
    :leader="info.leader?.id"
  />
</template>

<script setup lang="ts">
const { info, index } = defineProps<{
  info?: TGroup;
  index: number;
}>();

const { $api } = useNuxtApp();
const queryClient = useQueryClient();

const newProjectName = ref();

const { mutate: removeGroup } = useMutation({
  mutationFn: $api.group.remove.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['class.info'] });
  },
  onError: err => useErrorHandler(err),
});

onMounted(() => {
  newProjectName.value = info?.projectName;
});

const edit = ref(false);

const { mutate: modifyProjectName, isPending } = useMutation({
  mutationFn: $api.group.modifyProjectName.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['class.info'] });
    useMessage({ message: '修改成功', type: 'success' });
  },
  onError: err => useErrorHandler(err),
});

const changeGroupUser = ref();
</script>
