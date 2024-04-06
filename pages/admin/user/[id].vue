<template>
  <el-tabs
    v-model="selectedTab"
    tab-position="top"
    class="lg:px-2"
    @tab-change="$router.replace({ query: { action: selectedTab } })"
  >
    <el-tab-pane name="modify" label="修改用户信息">
      <ModifyUser :user-id="id" />
    </el-tab-pane>
    <el-tab-pane name="password" label="修改密码">
      <ModifyPassword :user-id="id" />
    </el-tab-pane>
    <el-tab-pane name="info" label="用户信息">
      <UserProfile :user-id="id" type="admin" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
useHeadSafe({
  title: '管理用户',
});

const route = useRoute();
const selectedTab = ref(route.query.action?.toString() ?? 'modify');
const id = route.params.id.toString();
</script>
