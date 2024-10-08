<template>
  <div class="space-y-4">
    <template v-if="classInfo">
      <div class="flex flex-col gap-4 md:flex-row">
        <div class="md:basis-1/3">
          <el-card class="h-full">
            <template #header>
              <el-icon class="i-tabler:school" />
              <el-breadcrumb separator="/" class="ml-2">
                <el-breadcrumb-item
                  :to="{ path: '/admin/class/list' }"
                >
                  班级管理
                </el-breadcrumb-item>
                <el-breadcrumb-item>
                  {{ classInfo.className }}
                </el-breadcrumb-item>
              </el-breadcrumb>
            </template>
            <el-descriptions size="large" :column="2">
              <el-descriptions-item>
                <template #label>
                  <div class="text-[16px]!">
                    <el-icon class="i-tabler:clock-share" />
                    入学年份
                  </div>
                </template>
                <span class="text-[16px]!">
                  {{ classInfo.enterYear }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="text-[16px]!">
                    <el-icon class="i-tabler:user" />
                    教师
                  </div>
                </template>
                <span class="space-x-2 text-[16px]!">
                  <el-link :href="`/admin/user/${classInfo.teacher.id}`">
                    {{ classInfo.teacher?.username }}
                  </el-link>
                </span>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="text-[16px]!">
                    <el-icon class="i-tabler:users" />
                    人数
                  </div>
                </template>
                <span class="space-x-2 text-[16px]!">
                  {{ classInfo.students.length }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="text-[16px]!">
                    <el-icon class="i-tabler:clipboard-list" />
                    名单
                  </div>
                </template>
                <el-button icon="i-tabler:table-export" size="small" class="mt-1" @click="exportStudentList">
                  导出
                </el-button>
                <el-button icon="i-tabler:eye" size="small" class="mt-1" @click="userListDialog = true">
                  查看
                </el-button>
                <el-drawer
                  v-model="userListDialog"
                  title="学生名单"
                >
                  <el-scrollbar>
                    <el-table
                      :data="classInfo?.students"
                      class="cursor-pointer mt-0!"
                      :row-class-name="tableRowClassName"
                      @row-click="row => navigateTo(`/admin/user/${row.id}`)"
                    >
                      <el-table-column type="index" width="50" />
                      <el-table-column prop="username" label="姓名" />
                      <el-table-column prop="schoolId" label="学号" />
                    </el-table>
                  </el-scrollbar>
                </el-drawer>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </div>
        <div class="md:basis-2/3">
          <el-card class="mt-2 h-full md:mt-0">
            <template #header>
              <el-icon class="i-tabler:timeline-event" />
              班级状态
              <el-popconfirm
                title="确定要删除班级吗？"
                width="200"
                confirm-button-type="danger"
                hide-icon
                @confirm="removeClass({ id })"
              >
                <template #reference>
                  <el-link icon="i-tabler:trash" type="danger" class="float-right">
                    删除班级
                  </el-link>
                </template>
              </el-popconfirm>
            </template>
            <div class="space-y-4">
              <StateStep v-if="!editTimetable" :class-info="classInfo" direction="horizontal" />
              <StateStepMaker v-else v-model="newStateTimetable" direction="horizontal" />
              <div class="flex">
                <div class="mx-auto flex flex-row gap-3">
                  <el-button-group>
                    <el-button :disabled="classInfo.state === step[0]" @click="modifyState(-1)">
                      <el-icon class="i-tabler:arrow-left" />
                      上一状态
                    </el-button>
                    <el-button :disabled="classInfo.state === step[step.length - 1]" @click="modifyState(1)">
                      下一状态
                      <el-icon class="i-tabler:arrow-right" />
                    </el-button>
                  </el-button-group>
                  <el-button-group>
                    <el-button v-if="!editTimetable" @click="editTimetable = true">
                      修改时间表
                    </el-button>
                    <template v-else>
                      <el-button icon="i-tabler:check" @click="modifyTimetable(); editTimetable = false">
                        提交
                      </el-button>
                      <el-button icon="i-tabler:x" @click="revertTimetableChange(); editTimetable = false">
                        取消
                      </el-button>
                    </template>
                  </el-button-group>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
      <template v-if="studentsFree?.length">
        <el-alert type="warning" show-icon :closable="false">
          <template #title>
            还有 {{ studentsFree.length }} 名同学没有小组<span class="text-sm">（右键学生姓名可手动分配小组）</span>
          </template>
          <span class="break-all text-wrap space-x-1.5">
            <span
              v-for="(author, index) of studentsFree"
              :key="index"
              @contextmenu.prevent="changeGroupUser = author"
            >
              <el-link :href="`/admin/user/${author?.id}`">
                {{ author?.username }}
              </el-link>
            </span>
          </span>
        </el-alert>
      </template>
      <el-collapse-transition>
        <template v-if="classInfo.state === 'initialized'">
          <div class="flex flex-row gap-2">
            <div>
              <el-input-number v-model="newGroupCount" :min="1" step-strictly :step="1" :max="15" />
            </div>
            <el-button
              @click="createEmptyGroups({
                id: classInfo!.id,
                amount: newGroupCount,
              })"
            >
              创建空白小组
            </el-button>
          </div>
        </template>
      </el-collapse-transition>
    </template>
    <template v-if="classInfo?.groups">
      <div class="grid gap-2 md:grid-cols-2 md:gap-4">
        <template v-for="(group, index) in classInfo?.groups" :key="group.id">
          <TeacherGroupInfo :info="group" :index="index + 1" />
        </template>
      </div>
    </template>
    <el-button
      v-if="classInfo && classInfo.state !== 'initialized'"
      size="large"
      @click="createEmptyGroups({ id: classInfo.id, amount: 1 })"
    >
      <el-icon class="i-tabler:plus" />
      创建新小组
    </el-button>
  </div>
  <UserActions
    v-model="changeGroupUser"
    :class-id="id"
  />
</template>

<script lang="ts" setup>
import writeXlsxFile from 'write-excel-file';

const { $api } = useNuxtApp();

const id = useRoute().params.id.toString();

const queryClient = useQueryClient();
const { data: classInfo, suspense: classInfoSuspense } = useQuery({
  queryKey: ['class.info', { id }],
  queryFn: () => $api.class.infoFull.query({ id }),
});
await classInfoSuspense();

useHeadSafe({
  title: `${classInfo.value?.className}· 班级管理`,
});

const userListDialog = ref(false);

const editTimetable = ref(false);
const newStateTimetable = ref(classInfo.value?.stateTimetable.map(x => new Date(x)));

const step: TClassState[] = [
  'initialized', // 初始化
  'selectGroup', // 选择小组
  'thesisProposal', // 开题报告
  'concludingReport', // 结题报告
  'submitPaper', // 提交论文
];

function revertTimetableChange() {
  newStateTimetable.value = classInfo.value?.stateTimetable.map(x => new Date(x));
}

const { mutate: modifyMutation } = useMutation({
  mutationFn: $api.class.modify.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['class.info'] });
    queryClient.invalidateQueries({ queryKey: ['group.list'] });
  },
  onError: (err) => {
    revertTimetableChange();
    useErrorHandler(err);
  },
});

const newGroupCount = ref(8);
const { mutate: createEmptyGroups } = useMutation({
  mutationFn: $api.class.initGroups.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['class.info'] });
    queryClient.invalidateQueries({ queryKey: ['group.list'] });
    useMessage({ type: 'success', message: '创建成功' });
  },
  onError: err => useErrorHandler(err),
});

const { mutate: removeClass } = useMutation({
  mutationFn: $api.class.remove.mutate,
  onSuccess: () => {
    navigateTo('/admin/class/list');
  },
  onError: err => useErrorHandler(err),
});

function modifyState(delta: number) {
  if (!classInfo.value)
    return;
  modifyMutation({ id: classInfo.value.id, state: step[step.indexOf(classInfo.value.state) + delta] });
}

function modifyTimetable() {
  if (!classInfo.value)
    return;
  modifyMutation({ id: classInfo.value.id, stateTimetable: newStateTimetable.value });
}

const studentsWithGroup = computed(
  () => {
    if (!classInfo.value?.groups.length)
      return [];
    return classInfo.value.groups.map(x => x.members).reduce((a, b) => a.concat(b));
  },
);

const studentsFree = computed(() => {
  const list = [];
  for (const s of (classInfo.value?.students ?? [])) {
    if (!(studentsWithGroup.value ?? []).find(student => student.id === s.id))
      list.push(s);
  }
  return list;
});
const changeGroupUser = ref();

function tableRowClassName({ row }: { row: TMinimalUser }) {
  if (studentsFree.value.some(s => s.id === row.id))
    return 'bg-amber-50!';
  return '';
}

async function exportStudentList() {
  const list = classInfo.value?.groups
    .map((x, i) => x.members.map(e => ({ ...e, group: i + 1 })))
    .reduce((p, c) => p.concat(c));
  if (!list)
    return;

  type TRow = (typeof list)[0];
  const schema = [{
    column: '小组',
    type: Number,
    value: (x: TRow) => x.group,
    width: 5,
  }, {
    column: '姓名',
    type: String,
    value: (x: TRow) => x.username,
    width: 20,
  }, {
    column: '学号',
    type: String,
    value: (x: TRow) => x.schoolId,
    width: 30,
  }];

  await writeXlsxFile(list, {
    schema,
    fileName: `${classInfo.value?.className}名单.xlsx`,
  });
}
</script>
