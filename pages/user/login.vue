<template>
  <div class="h-content flex justify-center">
    <el-card class="w-xl self-center">
      <el-tabs v-model="selected" class="mb-2">
        <el-tab-pane label="深中树账号" name="tree" />
        <el-tab-pane label="希悦账号" name="seiue" />
      </el-tabs>

      <el-form label-position="top">
        <el-form-item>
          <div>
            <el-icon class="i-tabler:user" />
            学工号
          </div>
          <el-input
            v-model="form.schoolId"
            @keyup.enter="form.schoolId && form.password ? loginMutation(form) : () => {}"
          />
        </el-form-item>
        <el-form-item>
          <div>
            <el-icon class="i-tabler:lock" />
            密码
          </div>
          <el-input
            v-model="form.password" type="password" show-password
            @keyup.enter="form.schoolId && form.password ? loginMutation(form) : () => {}"
          />
        </el-form-item>
        <el-form-item class="m-0">
          <el-button class="ml-auto" color="#15803d" :loading="isPending" @click="loginMutation(form)">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '~/stores/user';

useHeadSafe({
  title: '登录',
});

const { $api } = useNuxtApp();
const userStore = useUserStore();

const selected = ref<'tree' | 'seiue'>('tree');

const form = reactive({
  schoolId: '',
  password: '',
});

const { mutate: loginMutation, isPending } = useMutation({
  mutationFn: async (input: { schoolId: string; password: string }) => {
    if (selected.value === 'tree')
      return await $api.user.login.mutate(input);
    else
      return await $api.user.seiueLogin.mutate(input);
  },
  onSuccess: (res) => {
    userStore.login(res);
    if (res.firstTimeLogin) {
      navigateTo({
        path: `/user/${res.id}`,
        query: {
          action: 'password',
        },
      });
    } else {
      useRouterBack();
    }
    useMessage({
      message: '登录成功',
      type: 'success',
    });
  },
  onError: err => useErrorHandler(err),
});
</script>
