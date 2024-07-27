<template>
  <el-card>
    <AdminBreadcrumb :auto-detect="false" parent-path="/admin/user/list" :current-name="userInfo?.username" />
  </el-card>
  <el-tabs
    v-model="selectedTab"
    tab-position="top"
    class="md:px-2"
    @tab-change="$router.replace({ query: { action: selectedTab } })"
  >
    <el-tab-pane name="info" label="用户信息">
      <UserProfile :user-id="id" type="admin" />
    </el-tab-pane>
    <el-tab-pane name="modify" label="修改用户信息">
      <ModifyUser :user-id="id" />
    </el-tab-pane>
    <el-tab-pane name="password" label="修改密码">
      <ModifyPassword :user-id="id" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
useHeadSafe({
  title: '学生管理',
});

const { $api } = useNuxtApp();
const route = useRoute();
const selectedTab = ref(route.query.action?.toString() ?? 'info');
const id = route.params.id.toString();

const { data: userInfo, suspense } = useQuery({
  queryKey: ['user.profile', { id }],
  queryFn: () => $api.user.profile.query({ id }),
});
await suspense();
</script>
