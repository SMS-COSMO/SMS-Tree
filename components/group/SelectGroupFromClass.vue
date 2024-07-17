<template>
  <el-select-v2
    v-model="selected"
    :options="options ?? []"
    filterable
    placeholder="请选择移动的目标小组"
    @change="emit('update:modelValue', selected)"
  >
    <template #default="{ item }">
      <el-tag type="info" class="mr-2 -ml-3" effect="plain" disable-transitions>
        小组 {{ options.findIndex(e => e.value === item.value) + 1 }}
      </el-tag>
      <el-popover placement="top" :width="400" trigger="hover" :show-after="600">
        <template #reference>
          {{ item.label }}
        </template>
        <el-descriptions title="小组信息" :column="1" border>
          <el-descriptions-item label="ID">
            <el-tag type="info" disable-transitions>
              {{ item.value }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="成员">
            <GroupMembers
              :authors="groups?.find((v) => v.id === item.value)?.members"
              :leader="groups?.find((v) => v.id === item.value)?.leader"
              type="link"
            />
          </el-descriptions-item>
        </el-descriptions>
      </el-popover>
    </template>
  </el-select-v2>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string[] | string;
  classId: string;
}>();
const emit = defineEmits(['update:modelValue']);

const { $api } = useNuxtApp();

const selected = ref(props.modelValue);

const cascaderValue = ref<string[]>();
const groupId = defineModel<string>();
watch(cascaderValue, (v) => {
  if (v)
    groupId.value = v[v?.length - 1];
});

const { data: groups, suspense: groupListSuspense } = useQuery({
  queryKey: ['group.list', { classId: props.classId }],
  queryFn: () => $api.group.list.query({ classId: props.classId }),
});
await groupListSuspense();

const options = computed(
  () => (groups.value ?? []).map(v1 => ({
    value: v1.id,
    label: v1.projectName ?? '未知课题名',
  })),
);
</script>
