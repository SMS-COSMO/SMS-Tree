<template>
  <div class="space-y-4">
    <template v-if="classInfo">
      <el-row :gutter="16">
        <el-col :span="device.isMobileOrTablet ? 24 : 8">
          <el-card>
            <template #header>
              <el-icon class="i-tabler:school" />
              {{ classInfo.className }}
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
                <el-button size="small" class="mt-1" @click="userListDialog = true">
                  点击查看
                </el-button>
                <el-drawer
                  v-model="userListDialog"
                  title="学生名单"
                >
                  <el-scrollbar>
                    <el-table
                      :data="classInfo?.students"
                      class="cursor-pointer mt-0!"
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
        </el-col>
        <el-col :span="device.isMobileOrTablet ? 24 : 16">
          <el-card class="mt-2 h-full md:mt-0">
            <template #header>
              <el-icon class="i-tabler:timeline-event" />
              班级状态
            </template>
            <div class="space-y-4">
              <StateStep :class-info="classInfo" direction="horizontal" show-archived />
              <div class="flex flex-row gap-2">
                <el-button-group class="mx-auto">
                  <el-button :disabled="classInfo.state === step[0]" @click="modifyState(-1)">
                    <el-icon class="i-tabler:arrow-left" />
                    上一状态
                  </el-button>
                  <el-button :disabled="classInfo.state === step[step.length - 1]" @click="modifyState(1)">
                    下一状态
                    <el-icon class="i-tabler:arrow-right" />
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-collapse-transition>
        <template v-if="classInfo.state === 'initialized'">
          <div class="flex flex-row gap-2">
            <el-input-number v-model="newGroupCount" :min="1" step-strictly :step="1" :max="15" />
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
      <div class="grid gap-2 lg:grid-cols-2 lg:gap-4">
        <template v-for="(group, index) in classInfo.groups" :key="group.id">
          <TeacherGroupInfo :info="group" :index="index + 1" />
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
const { $api } = useNuxtApp();
const device = useDevice();
useHeadSafe({
  title: '班级信息',
});

const id = useRoute().params.id.toString();

const queryClient = useQueryClient();
const { data: classInfo, suspense: classInfoSuspense } = useQuery({
  queryKey: ['classInfo', { id }],
  queryFn: () => $api.class.infoFull.query({ id }),
});
await classInfoSuspense();

const userListDialog = ref(false);

const step: TClassState[] = [
  'initialized', // 初始化
  'selectGroup', // 选择小组
  'thesisProposal', // 开题报告
  'concludingReport', // 结题报告
  'submitPaper', // 提交论文
  'archived', // 归档
];

const { mutate: modifyStateMutation } = useMutation({
  mutationFn: $api.class.modifyState.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['classInfo'] });
    queryClient.invalidateQueries({ queryKey: ['groupList'] });
  },
  onError: err => useErrorHandler(err),
});

const newGroupCount = ref(8);
const { mutate: createEmptyGroups } = useMutation({
  mutationFn: $api.class.initGroups.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['classInfo'] });
    queryClient.invalidateQueries({ queryKey: ['groupList'] });
    useElMessage({ type: 'success', message: '创建成功' });
  },
  onError: err => useErrorHandler(err),
});

function modifyState(delta: number) {
  if (!classInfo.value)
    return;
  modifyStateMutation({ id: classInfo.value.id, newState: step[step.indexOf(classInfo.value.state) + delta] });
}
</script>
