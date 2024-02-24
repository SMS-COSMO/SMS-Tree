<template>
  <el-row v-if="classInfo.state === 'initialized'" justify="center">
    <!-- tell the user to wait for teacher to change the state -->
    <el-col :span="22">
      <el-card>
        <template #header>
          <span class="text-xl font-bold">等待老师开启小组选择</span>
        </template>
        <p class="">
          老师还没有开启小组选择，请耐心等待~
        </p>
      </el-card>
    </el-col>
  </el-row>
  <el-row v-else-if="classInfo.state === 'selectGroup'">
    <el-col :span="22">
      <el-space direction="vertical" style="width: 100%;" :size="20" fill>
        <el-card>
          <template #header>
            <span class="text-xl font-bold">请选择一个小组加入</span>
          </template>

          <el-table :data="availableGroups" stripe border>
            <el-table-column prop="leader" label="组长" />
            <el-table-column prop="members" label="已有组员">
              <template #default="{ row }">
                <span v-if="!row.members.length">还没有组员~</span>
                <span v-else>
                  <el-space>

                    <template v-for="member in row.members" :key="member">
                      <el-tag>{{ member }}</el-tag>
                    </template>
                  </el-space>
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button
                  v-if="!userStore.groupIds.length"
                  plain
                  type="primary"
                  @click="joinGroup(row.id)"
                >
                  加入
                </el-button>
                <template v-else-if="userStore.groupIds.includes(row.id)">
                  <el-button type="danger" @click="leaveGroup(row.id)">
                    退出小组
                  </el-button>
                </template>
                <template v-else>
                  <el-button plain @click="changeGroup(row.id)">
                    更换为此小组
                  </el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-space>
    </el-col>
  </el-row>
  <el-row v-else-if="classInfo.state === 'submitPaper'" :gutter="20">
    <el-col :span="22">
      <el-space direction="vertical" style="width: 100%;" :size="20" fill>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card>
              <el-descriptions :column="2" :border="true">
                <el-descriptions-item label="班级" />
                <el-descriptions-item label="" />
                <el-descriptions-item label="小组成员" :span="2" />
              </el-descriptions>
            </el-card>
          </el-col>
          <el-col :span="16">
            <el-card>
              <template #header>
                Stats
              </template>
            </el-card>
          </el-col>
        </el-row>

        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="上传" name="first">
            <el-upload drag multiple>
              <el-icon class="el-icon--upload">
                <ElIconUploadFilled />
              </el-icon>
              <div class="el-upload__text">
                拖拽文件或 <em>点击这里上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  Place Holder
                </div>
              </template>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="已上传文件" name="second">
            <el-collapse>
              <el-collapse-item title="Placeholder">
                placeholder
              </el-collapse-item>
            </el-collapse>
          </el-tab-pane>
        </el-tabs>

        <el-card>
          laos
        </el-card>
      </el-space>
    </el-col>

    <el-col :span="2">
      <div style="height: 500px">
        <el-steps direction="vertical" :active="1">
          <el-step :icon="ElIconUpload" title="提交" />
          <el-step :icon="ElIconCircleCheck" title="查重" />
          <el-step :icon="ElIconEdit" title="批改" />
        </el-steps>
      </div>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
const activeTab = ref('first');
const { $api } = useNuxtApp();
const userStore = useUserStore();
const classInfo = await $api.class.content.query({ id: userStore.classIds[0] });
const availableGroups = await $api.group.list.query({ classId: userStore.classIds[0] });
// refresh user group info
const userInfo = await $api.user.profile.query({ id: userStore.userId });
userStore.groupIds = userInfo.groupIds;
async function joinGroup(groupId: string) {
  try {
    const message = await $api.group.join.mutate({ userId: userStore.userId, groupId });
    ElMessage.success(message);
    userStore.groupIds.push(groupId);
  } catch (e) {
    console.error(e);
  }
}

async function leaveGroup(groupId: string) {
  try {
    const message = await $api.group.leave.mutate({ userId: userStore.userId, groupId });
    ElMessage.success(message);
    userStore.groupIds = userStore.groupIds.filter(id => id !== groupId);
  } catch (e) {
    console.error(e);
  }
}

async function changeGroup(newGroupId: string) {
  try {
    const oldGroupId = userStore.groupIds[0];
    const message = await $api.group.change.mutate({ userId: userStore.userId, oldGroupId, newGroupId });
    ElMessage.success(message);
    userStore.groupIds = userStore.groupIds.filter(id => id !== oldGroupId);
    userStore.groupIds.push(newGroupId);
  } catch (e) {
    console.error(e);
  }
}
</script>

<style scoped lang="scss">
@import "~/styles/color.scss";

em {
  color: $color-primary-0 !important;
}
</style>
