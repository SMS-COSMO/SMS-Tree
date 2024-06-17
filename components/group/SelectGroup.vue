<template>
  <client-only>
    <el-cascader v-model="cascaderValue" :options="options" filterable>
      <template #default="{ node, data }">
        <el-popover v-if="node.isLeaf" placement="top" :width="400" trigger="hover" :show-after="600">
          <template #reference>
            {{ data.label }}
          </template>
          <el-descriptions title="小组信息" :column="1" border>
            <el-descriptions-item label="ID">
              <el-tag type="info" disable-transitions>
                {{ data.value }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="成员">
              <GroupMembers
                :authors="groupList.find((v) => v.id === data.value)?.members"
                :leader="groupList.find((v) => v.id === data.value)?.leader"
                type="link"
              />
            </el-descriptions-item>
          </el-descriptions>
        </el-popover>
        <span v-else>{{ data.label }}</span>
      </template>
    </el-cascader>
    <template #fallback>
      <SelectPlaceholder width="250" />
    </template>
  </client-only>
</template>

<script setup lang="ts">
import type { CascaderOption } from 'element-plus';

const { $api } = useNuxtApp();

const cascaderValue = ref<string[]>();
const groupId = defineModel<string>();
watch(cascaderValue, (v) => {
  if (v)
    groupId.value = v[v?.length - 1];
});

// Reset cascader when modelValue changes
watch(groupId, (v) => {
  if (v === '')
    cascaderValue.value = [];
});

const { data: classList, suspense: classListSuspense } = useQuery({
  queryKey: ['class.list'],
  queryFn: () => $api.class.list.query(),
});
await classListSuspense();
const groupList = ref<TGroupList>([]);

const options: CascaderOption[] = await Promise.all(
  classList.value?.map(async (v) => {
    const { data: groups, suspense: groupListSuspense } = useQuery({
      queryKey: ['group.list', { classId: v.id }],
      queryFn: () => $api.group.list.query({ classId: v.id }),
    });
    await groupListSuspense();

    groupList.value = groupList.value.concat(groups.value ?? []);
    return {
      value: v.id,
      label: v.className,
      children: (groups.value ?? []).map(v1 => ({
        value: v1.id,
        label: v1.projectName ?? '未知课题名',
      })),
    };
  }) ?? [],
);
</script>
