<template>
  <el-card>
    <template #header>
      <el-icon class="i-tabler:info-circle" />
      小组信息
    </template>
    <el-descriptions
      :column="device.isMobileOrTablet ? 1 : 2"
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
          <el-link :href="`/user/${groupInfo?.leader?.id}`">
            {{ groupInfo?.leader?.username }}
          </el-link>
        </span>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="text-[16px]!">
            <el-icon class="i-tabler:users" />
            小组成员
          </div>
        </template>
        <span class="text-[16px]!">
          <GroupMembers :authors="groupInfo?.members" :leader="groupInfo?.leader" type="link" class="inline" />
        </span>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions
      :column="1"
      size="large" class="mb-[-16px] max-w-full!"
    >
      <el-descriptions-item>
        <template #label>
          <div class="text-[15px]!">
            <el-icon class="i-tabler:notebook" />
            课题名
            <el-popover
              v-if="groupInfo"
              placement="bottom"
              title="修改课题名"
              :width="300"
              trigger="click"
            >
              <template #reference>
                <el-link icon="i-tabler:edit" class="ml-2 text-[16px]!">
                  修改
                </el-link>
              </template>
              <el-input v-model="newProjectName" @blur="edit = false">
                <template #append>
                  <el-button :loading="isPending" @click="modifyProjectName({ groupId: groupInfo!.id, newProjectName })">
                    <el-icon class="i-tabler:check" />
                  </el-button>
                </template>
              </el-input>
            </el-popover>
          </div>
        </template>
        <span class="text-[16px]!">
          {{ groupInfo?.projectName ?? '待填写' }}
        </span>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
  <DefineTemplate v-slot="{ name }">
    <el-alert
      class="mb-4!"
      :title="`${name}提交成功`"
      type="success"
      description="等待老师反馈"
      show-icon
      :closable="false"
    />
  </DefineTemplate>
  <el-tabs v-model="tabState" type="border-card">
    <el-tab-pane label="活动记录" name="">
      <template v-for="note in groupInfo?.notes" :key="note.id">
        <NoteCard :note="note" />
      </template>
      <NewNote />
    </el-tab-pane>
    <el-tab-pane v-if="reachedState('thesisProposal')" label="开题报告" name="thesisProposal">
      <ReportForm
        v-if="!groupInfo?.reports?.some(x => x.category === 'thesisProposal')"
        category="thesisProposal"
        type="create"
      />
      <template v-else>
        <ReuseTemplate name="开题报告" />
        <ReportContent :report="groupInfo?.reports?.find(x => x.category === 'thesisProposal')!" />
      </template>
    </el-tab-pane>
    <el-tab-pane v-if="reachedState('concludingReport')" label="结题报告" name="concludingReport">
      <ReportForm
        v-if="!groupInfo?.reports?.some(x => x.category === 'concludingReport')"
        category="concludingReport"
        type="create"
      />
      <template v-else>
        <ReuseTemplate name="结题报告" />
        <ReportContent :report="groupInfo?.reports?.find(x => x.category === 'concludingReport')!" />
      </template>
    </el-tab-pane>
    <el-tab-pane v-if="reachedState('submitPaper')" label="论文" name="submitPaper">
      <PaperForm v-if="!groupInfo?.paper" type="create" />
      <template v-else>
        <ReuseTemplate name="论文" />
        <PaperContent :id="groupInfo?.paper.id" :allow-modify="!groupInfo.paper.isPublic" />
      </template>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
const props = defineProps<{
  classState: TClassState;
}>();

const [DefineTemplate, ReuseTemplate] = createReusableTemplate();

const { $api } = useNuxtApp();
const device = useDevice();

const edit = ref(false);
const newProjectName = ref();

const queryClient = useQueryClient();
const { mutate: modifyProjectName, isPending } = useMutation({
  mutationFn: $api.group.modifyProjectName.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['group.info'] });
    useMessage({ message: '修改成功', type: 'success' });
  },
  onError: err => useErrorHandler(err),
});

const userStore = useUserStore();
const { data: groupInfo, suspense: groupInfoSuspense } = useQuery({
  queryKey: ['group.info'],
  queryFn: () => $api.group.info.query({ id: userStore.activeGroupIds[0] }),
});
await groupInfoSuspense();

const tabState = ref(props.classState);

function reachedState(currentState: string) {
  return classStateSteps.indexOf(props.classState) >= classStateSteps.indexOf(currentState);
}

onMounted(() => {
  newProjectName.value = groupInfo.value?.projectName;
});
</script>
