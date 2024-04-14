<template>
  <client-only>
    <el-cascader v-model="cascaderValue" :options="options" filterable>
      <template #default="{ node, data }">
        <el-popover v-if="node.isLeaf" placement="top" :width="400" trigger="hover">
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
import type { TGroupList } from '~/types';

const { $api } = useNuxtApp();

const cascaderValue = ref<string[]>();
const groupId = defineModel<string>();
watch(cascaderValue, (v) => {
  if (v)
    groupId.value = v[v?.length - 1];
});

const classList = await $api.class.list.query();
const groupList = ref<TGroupList>([]);

const options: CascaderOption[] = await Promise.all(
  classList?.map(async (v) => {
    const groups = await $api.group.list.query({ classId: v.id }) ?? [];
    groupList.value = groupList.value.concat(groups);
    return {
      value: v.id,
      label: v.className,
      children: groups.map(v1 => ({
        value: v1.id,
        label: v1.projectName ?? '未知课题名',
      })),
    };
  }) ?? [],
);
</script>
