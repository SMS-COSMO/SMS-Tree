<template>
  <div class="mb-22">
    <el-tabs
      v-if="isMine"
      v-model="selectedTab"
      class="box-border w-full"
      :tab-position="device.isMobileOrTablet ? 'top' : 'left'"
      @tab-change="$router.replace({ query: { action: selectedTab } })"
    >
      <el-tab-pane name="info" label="用户信息" class="lg:ml-3">
        <UserProfile type="normal" :user-id="id" />
      </el-tab-pane>
      <el-tab-pane name="password" label="修改密码" class="lg:ml-3">
        <ModifyPassword :user-id="id" />
      </el-tab-pane>
      <el-tab-pane v-if="['teacher', 'admin'].includes(userStore.role)" name="modify" label="修改用户信息" class="lg:ml-3">
        <ModifyUser :user-id="id" />
      </el-tab-pane>
    </el-tabs>
    <UserProfile v-else type="normal" :user-id="id" />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';

useHeadSafe({
  title: '用户信息',
});
const device = useDevice();

const route = useRoute();
const selectedTab = ref(route.query.action?.toString() ?? 'info');
const id = route.params.id.toString();
const userStore = useUserStore();

const isMine = userStore.userId === id || ['admin', 'teacher'].includes(userStore.role);
</script>
